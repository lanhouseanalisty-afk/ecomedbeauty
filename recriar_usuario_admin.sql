-- =====================================================
-- DELETAR USUÁRIO ANTIGO E CRIAR NOVO
-- Execute este script no SQL Editor do projeto NOVO
-- =====================================================

-- 1. Deletar o usuário antigo (isso vai deletar automaticamente o perfil e roles por CASCADE)
DELETE FROM auth.users 
WHERE email = 'reginaldo.mazaro@medbeauty.com.br';

-- 2. Criar novo usuário com a senha correta
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

-- 3. Criar perfil para o usuário
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

-- 4. Criar role de admin para o usuário
INSERT INTO public.user_roles (
  user_id,
  role
)
SELECT 
  id,
  'admin'::app_role
FROM auth.users
WHERE email = 'reginaldo.mazaro@medbeauty.com.br';

-- 5. Verificar se o usuário foi criado corretamente
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'reginaldo.mazaro@medbeauty.com.br';
