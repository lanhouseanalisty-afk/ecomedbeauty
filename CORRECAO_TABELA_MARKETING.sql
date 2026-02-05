-- ============================================
-- CORREÇÃO FINAL TABELA MARKETING E PERMISSÕES
-- ============================================

-- PARTE 1: GARANTIR QUE OS ROLES EXISTAM
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistica';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- ============================================
-- PARTE 2: CRIAÇÃO DA TABELA E ESTRUTURA
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS marketing_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id TEXT UNIQUE NOT NULL,
  event_name TEXT NOT NULL,
  consultant_name TEXT NOT NULL,
  regional_manager TEXT NOT NULL,
  event_date DATE NOT NULL,
  kit_type TEXT NOT NULL,
  has_thread_order BOOLEAN DEFAULT false,
  bonus_order_number TEXT,
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  extra_materials TEXT,
  status TEXT DEFAULT 'pending',
  approver_id UUID REFERENCES auth.users(id),
  approver_name TEXT,
  notes TEXT,
  tracking_number TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_marketing_requests_created_by ON marketing_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_status ON marketing_requests(status);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_request_id ON marketing_requests(request_id);

-- Trigger de data
CREATE OR REPLACE FUNCTION update_marketing_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS marketing_requests_updated_at ON marketing_requests;
CREATE TRIGGER marketing_requests_updated_at
  BEFORE UPDATE ON marketing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_requests_updated_at();

-- ============================================
-- PARTE 3: PERMISSÕES (RLS)
-- ============================================

ALTER TABLE marketing_requests ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas
DROP POLICY IF EXISTS "Users can view own requests" ON marketing_requests;
DROP POLICY IF EXISTS "Users can create requests" ON marketing_requests;
DROP POLICY IF EXISTS "Admins and Marketing can view all" ON marketing_requests;
DROP POLICY IF EXISTS "Admins and Marketing can update" ON marketing_requests;
DROP POLICY IF EXISTS "Logistica can view approved" ON marketing_requests;
DROP POLICY IF EXISTS "Logistica can update status" ON marketing_requests;
DROP POLICY IF EXISTS "Approvers can view assigned" ON marketing_requests;
DROP POLICY IF EXISTS "Approvers can update assigned" ON marketing_requests;

-- Recriar políticas

-- 1. Usuários Comuns (Ver seus próprios e Criar)
CREATE POLICY "Users can view own requests"
  ON marketing_requests FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create requests"
  ON marketing_requests FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 2. Admins e Marketing (Ver tudo e Editar tudo)
CREATE POLICY "Admins and Marketing can view all"
  ON marketing_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role::text IN ('admin', 'marketing_manager')
    )
  );

CREATE POLICY "Admins and Marketing can update"
  ON marketing_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role::text IN ('admin', 'marketing_manager')
    )
  );

-- 3. Logística (Ver Aprovados e Atualizar Status)
CREATE POLICY "Logistica can view approved"
  ON marketing_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role::text = 'logistica'
    )
    AND status IN ('approved', 'shipped', 'delivered', 'completed')
  );

CREATE POLICY "Logistica can update status"
  ON marketing_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role::text = 'logistica'
    )
  );

-- 4. Aprovadores (Gerentes Regionais que aprovam)
CREATE POLICY "Approvers can view assigned"
  ON marketing_requests FOR SELECT
  USING (auth.uid() = approver_id);

CREATE POLICY "Approvers can update assigned"
  ON marketing_requests FOR UPDATE
  USING (auth.uid() = approver_id);


/*
NOTA: Para testar o acesso de Logística:
1. Vá na tabela 'user_roles' no Supabase Dashboard.
2. Encontre seu próprio user_id.
3. Mude seu role para 'logistica' (ou adicione uma nova linha com role 'logistica').
*/
