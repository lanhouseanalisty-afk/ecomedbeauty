-- CRIAR_SISTEMA_TICKETS_TECH.sql
-- Sistema Completo de Help Desk / Service Desk para Supabase
-- Autor: Antigravity Agent

-- 1. AJUSTES DE PERMISSÕES E ENUMS
-- Adiciona a role 'tech' ao enum app_role para permitir técnicos
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'tech';

DO $$ BEGIN
    -- Criação dos Tipos do Ticket se não existirem
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'pending', 'resolved', 'closed');
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SEQUÊNCIA
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- 3. TABELAS (Estrutura)

-- Categorias de Tickets com SLA
CREATE TABLE IF NOT EXISTS ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GARANTIR COLUNAS EM TICKET_CATEGORIES (Correção para tabelas existentes)
DO $$ BEGIN
    ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS sla_hours INTEGER DEFAULT 24;
    ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Tabela Principal de Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open',
    priority ticket_priority DEFAULT 'medium',
    
    category_id UUID REFERENCES ticket_categories(id),
    requester_id UUID REFERENCES auth.users(id) NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Campos Adicionados com Default
    ticket_number TEXT DEFAULT ('TKT-' || lpad(nextval('ticket_number_seq')::text, 6, '0')),
    due_date TIMESTAMP WITH TIME ZONE
);

-- GARANTIR COLUNAS EM TICKETS
DO $$ BEGIN
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT DEFAULT ('TKT-' || lpad(nextval('ticket_number_seq')::text, 6, '0'));
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
    WHEN others THEN null;
END $$;


-- Mensagens / Chat do Ticket
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Base de Conhecimento (Knowledge Base)
CREATE TABLE IF NOT EXISTS kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES ticket_categories(id),
    author_id UUID REFERENCES auth.users(id),
    
    is_public BOOLEAN DEFAULT true,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_tickets_requester ON tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_kb_search ON kb_articles USING GIN(to_tsvector('portuguese', title || ' ' || content));

-- 5. FUNÇÕES E TRIGGERS

-- Atualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Calcular Due Date baseado no SLA da Categoria
CREATE OR REPLACE FUNCTION set_ticket_sla()
RETURNS TRIGGER AS $$
DECLARE
    hours int;
BEGIN
    IF NEW.category_id IS NOT NULL THEN
        SELECT sla_hours INTO hours FROM ticket_categories WHERE id = NEW.category_id;
        IF hours IS NOT NULL THEN
            NEW.due_date = NEW.created_at + (hours || ' hours')::INTERVAL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_ticket_sla ON tickets;
CREATE TRIGGER trg_set_ticket_sla
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_sla();

-- 6. RLS (SEGURANÇA)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;

-- Políticas de Tickets
DROP POLICY IF EXISTS "Tech and Admin view all tickets" ON tickets;
DROP POLICY IF EXISTS "Users view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users create tickets" ON tickets;
DROP POLICY IF EXISTS "Tech update tickets" ON tickets;

-- Política para Techs/Admins verem tudo
CREATE POLICY "Tech and Admin view all tickets" ON tickets
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role')::text IN ('service_role', 'admin', 'tech', 'manager') OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role::text IN ('admin', 'tech', 'manager') 
        )
    );

CREATE POLICY "Users view own tickets" ON tickets
    FOR SELECT TO authenticated
    USING (requester_id = auth.uid());

CREATE POLICY "Users create tickets" ON tickets
    FOR INSERT TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Tech update tickets" ON tickets
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role::text IN ('admin', 'tech', 'manager')
        )
    );

-- Políticas Chat
DROP POLICY IF EXISTS "View messages for visible tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Send messages to visible tickets" ON ticket_messages;

CREATE POLICY "View messages for visible tickets" ON ticket_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id) 
        AND (
            is_internal = false OR 
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'tech', 'manager'))
        )
    );

CREATE POLICY "Send messages to visible tickets" ON ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id)
    );

-- Políticas KB e Categorias
DROP POLICY IF EXISTS "Read categories" ON ticket_categories;
DROP POLICY IF EXISTS "Read kb public" ON kb_articles;

CREATE POLICY "Read categories" ON ticket_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read kb public" ON kb_articles FOR SELECT TO authenticated USING (
    is_public = true OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'tech'))
);

-- 7. DADOS INICIAIS (Seeding)
INSERT INTO ticket_categories (name, description, sla_hours) VALUES
    ('Hardware', 'Problemas com equipamentos físicos', 48),
    ('Software', 'Instalação ou erros de software', 24),
    ('Acesso e Login', 'Problemas com senhas e permissões', 4),
    ('Rede/Internet', 'Conectividade e Wifi', 8),
    ('Outros', 'Assuntos gerais', 72)
ON CONFLICT DO NOTHING;
