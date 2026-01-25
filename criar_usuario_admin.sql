-- =====================================================
-- CRIAR USUÁRIO ADMIN NO NOVO PROJETO
-- Execute este script no SQL Editor do projeto NOVO
-- =====================================================

-- Criar um usuário admin
-- Email: reginaldo.mazaro@medbeauty.com.br
-- Senha: 1qazZAQ!2wsxXSW@

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'reginaldo.mazaro@medbeauty.com.br',
  crypt('1qazZAQ!2wsxXSW@', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Criar perfil para o usuário
INSERT INTO public.profiles (
  id,
  email,
  full_name
)
SELECT 
  id,
  email,
  'Reginaldo Mazaro'
FROM auth.users
WHERE email = 'reginaldo.mazaro@medbeauty.com.br';

-- Criar role de admin para o usuário
INSERT INTO public.user_roles (
  user_id,
  role
)
SELECT 
  id,
  'admin'::app_role
FROM auth.users
WHERE email = 'reginaldo.mazaro@medbeauty.com.br';

-- Verificar se o usuário foi criado
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'reginaldo.mazaro@medbeauty.com.br';
