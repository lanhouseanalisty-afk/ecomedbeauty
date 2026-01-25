-- CRIAR_CONTROLE_ATIVOS_TECH.sql
-- Sistema de Controle de Ativos (Notebooks, Tablets, Smartphones)
-- Baseado na demanda "Inventário Tech"

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE tech_device_type AS ENUM ('notebook', 'tablet', 'smartphone', 'monitor', 'peripherals', 'other');
    CREATE TYPE tech_asset_status AS ENUM ('available', 'in_use', 'maintenance', 'broken', 'retired', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA DE ATIVOS
CREATE TABLE IF NOT EXISTS tech_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag TEXT UNIQUE, -- Código de Patrimônio (ex: MB-NB-001)
    serial_number TEXT,
    model TEXT NOT NULL,   -- Ex: Dell Latitude 5420
    brand TEXT NOT NULL,   -- Ex: Dell, Samsung, Apple
    device_type tech_device_type NOT NULL,
    
    status tech_asset_status DEFAULT 'available',
    
    -- Quem está usando?
    assigned_to UUID REFERENCES auth.users(id), -- Se for usuário do sistema
    assigned_to_name TEXT, -- Nome texto livre caso não seja usuário do sistema (flexibilidade)
    
    location TEXT, -- Setor ou Unidade Física
    
    purchase_date DATE,
    warranty_expiration DATE,
    
    specifications JSONB DEFAULT '{}'::jsonb, -- Armazena RAM, Processador, HD, IMEIs, etc.
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HISTÓRICO DE MOVIMENTAÇÃO (Log)
CREATE TABLE IF NOT EXISTS tech_asset_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES tech_assets(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'create', 'assign', 'return', 'maintenance', 'update'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PERMISSÕES (RLS)
ALTER TABLE tech_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_asset_history ENABLE ROW LEVEL SECURITY;

-- Techs e Admins podem tudo
CREATE POLICY "Tech Full Access Assets" ON tech_assets
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'tech'))
    );
    
CREATE POLICY "Tech Full Access History" ON tech_asset_history
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'tech'))
    );

-- Usuários comuns podem ver apenas se estiverem alocados? (Opcional, por enquanto restrito a Tech)

-- 5. TRIGGER DE UPDATE
DROP TRIGGER IF EXISTS trg_assets_updated_at ON tech_assets;
CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON tech_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- 6. DADOS INICIAIS (Exemplo baseados no nome da planilha)
INSERT INTO tech_assets (asset_tag, model, brand, device_type, status, location, specifications) VALUES
('NB-001', 'Samsung Galaxy Book', 'Samsung', 'notebook', 'available', 'TI', '{"ram": "8GB", "storage": "256GB SSD"}'::jsonb),
('NB-002', 'Dell Latitude 3420', 'Dell', 'notebook', 'in_use', 'Comercial', '{"ram": "16GB", "storage": "512GB SSD"}'::jsonb),
('TAB-001', 'Galaxy Tab A7', 'Samsung', 'tablet', 'available', 'Estoque', '{"color": "Gray"}'::jsonb),
('SM-001', 'iPhone 13', 'Apple', 'smartphone', 'in_use', 'Diretoria', '{"storage": "128GB"}'::jsonb)
ON CONFLICT (asset_tag) DO NOTHING;
