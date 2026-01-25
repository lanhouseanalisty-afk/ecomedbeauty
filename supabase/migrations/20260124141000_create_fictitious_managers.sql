-- Criar usuários fictícios como gestores aprovadores
-- IMPORTANTE: Esta migration cria usuários de TESTE/DESENVOLVIMENTO
-- Em produção, use usuários reais com autenticação adequada

-- Primeiro, vamos garantir que os roles necessários existem
DO $$
BEGIN
  -- Verificar se o tipo app_role já tem os roles necessários
  -- Se não, precisamos recriar o enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'marketing_manager' 
    AND enumtypid = 'public.app_role'::regtype
  ) THEN
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
  END IF;
END $$;

-- Inserir gestores regionais na tabela profiles
-- Nota: Em produção, estes usuários devem ser criados via auth.users primeiro

-- Gestor 1: Jaqueline - Regional Manager
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

-- Gestor 2: Laice - Regional Manager
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

-- Gestor 3: Milena - Regional Manager
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

-- Gestor 4: Thiago - Regional Manager
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

-- Comentário de uso:
-- Estes usuários fictícios podem ser usados como gestores aprovadores
-- nas solicitações de marketing. Para login real, você precisará:
-- 1. Criar estes usuários no Supabase Auth (auth.users)
-- 2. Ou usar esta migration apenas para testes de interface
-- 3. Em produção, substituir por usuários reais

-- Para visualizar os gestores criados:
-- SELECT p.id, p.full_name, p.email, array_agg(ur.role) as roles
-- FROM profiles p
-- JOIN user_roles ur ON p.id = ur.user_id
-- WHERE ur.role IN ('admin', 'marketing_manager', 'regional_manager')
-- GROUP BY p.id, p.full_name, p.email;
