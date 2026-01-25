-- =====================================================
-- LIMPAR COMPLETAMENTE E CRIAR USUÁRIO
-- Execute APENAS UMA VEZ
-- =====================================================

-- PASSO 1: Deletar TODOS os usuários e dados relacionados
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
DELETE FROM auth.users;

-- PASSO 2: Criar o usuário
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'reginaldo.mazaro@ext.medbeauty.com.br',
  crypt('1qazZAQ!2wsxXSW@', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  '',
  '',
  '',
  ''
)
RETURNING id;

-- PASSO 3: Criar perfil
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id,
  'reginaldo.mazaro@ext.medbeauty.com.br',
  'Reginaldo Mazaro'
FROM auth.users
WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br';

-- PASSO 4: Criar role de admin
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'admin'::app_role
FROM auth.users
WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br';

-- PASSO 5: Verificar
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'reginaldo.mazaro@ext.medbeauty.com.br';
