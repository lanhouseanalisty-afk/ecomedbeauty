-- ============================================
-- SCRIPT DE EXECUÇÃO DAS MIGRATIONS DE MARKETING
-- Execute este script no Supabase SQL Editor
-- ============================================

-- MIGRATION 1: Criar tabela de solicitações de marketing
-- ============================================

-- Create marketing_requests table for event material requests
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
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE marketing_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
DROP POLICY IF EXISTS "Users can view own requests" ON marketing_requests;
CREATE POLICY "Users can view own requests"
  ON marketing_requests
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can create requests
DROP POLICY IF EXISTS "Users can create requests" ON marketing_requests;
CREATE POLICY "Users can create requests"
  ON marketing_requests
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Marketing managers can view all requests
DROP POLICY IF EXISTS "Marketing managers can view all" ON marketing_requests;
CREATE POLICY "Marketing managers can view all"
  ON marketing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'marketing_manager')
    )
  );

-- Policy: Marketing managers can update requests
DROP POLICY IF EXISTS "Marketing managers can update" ON marketing_requests;
CREATE POLICY "Marketing managers can update"
  ON marketing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'marketing_manager')
    )
  );

-- Policy: Approvers can view and update their assigned requests
DROP POLICY IF EXISTS "Approvers can manage assigned requests" ON marketing_requests;
CREATE POLICY "Approvers can manage assigned requests"
  ON marketing_requests
  FOR ALL
  USING (auth.uid() = approver_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_marketing_requests_created_by ON marketing_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_status ON marketing_requests(status);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_request_id ON marketing_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_event_date ON marketing_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_approver_id ON marketing_requests(approver_id);

-- Create updated_at trigger
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
-- MIGRATION 2: Criar gestores regionais
-- ============================================

-- Adicionar novos roles ao enum
DO $$
BEGIN
  -- Adicionar novos valores ao enum existente
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_manager';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'regional_manager';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rh';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'financeiro';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comercial';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistica';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'juridico';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tech';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ecommerce';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Gestor 1: Jaqueline
INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'jaqueline@ecomedbeauty.com',
  'Jaqueline',
  '(11) 98765-4321',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'regional_manager'),
  ('11111111-1111-1111-1111-111111111111', 'marketing_manager'),
  ('11111111-1111-1111-1111-111111111111', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Gestor 2: Laice
INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'laice@ecomedbeauty.com',
  'Laice',
  '(11) 98765-4322',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'regional_manager'),
  ('22222222-2222-2222-2222-222222222222', 'marketing_manager'),
  ('22222222-2222-2222-2222-222222222222', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Gestor 3: Milena
INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'milena@ecomedbeauty.com',
  'Milena',
  '(11) 98765-4323',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'regional_manager'),
  ('33333333-3333-3333-3333-333333333333', 'marketing_manager'),
  ('33333333-3333-3333-3333-333333333333', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Gestor 4: Thiago
INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'thiago@ecomedbeauty.com',
  'Thiago',
  '(11) 98765-4324',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'regional_manager'),
  ('44444444-4444-4444-4444-444444444444', 'marketing_manager'),
  ('44444444-4444-4444-4444-444444444444', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar gestores criados
SELECT 
  p.full_name, 
  p.email, 
  array_agg(ur.role) as roles
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.full_name IN ('Jaqueline', 'Laice', 'Milena', 'Thiago')
GROUP BY p.id, p.full_name, p.email;

-- Verificar tabela marketing_requests
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'marketing_requests'
ORDER BY ordinal_position;
