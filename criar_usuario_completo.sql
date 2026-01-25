-- =====================================================
-- CRIAR USUÁRIO USANDO FUNÇÃO DO SUPABASE
-- Execute este script no SQL Editor do projeto NOVO
-- =====================================================

-- Primeiro, vamos limpar qualquer usuário existente com este email
DELETE FROM auth.users WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br';

-- Agora vamos criar o usuário usando uma abordagem diferente
-- que é compatível com o sistema de autenticação do Supabase

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Gerar um novo ID
  new_user_id := gen_random_uuid();
  
  -- Inserir o usuário
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
    new_user_id,
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
  );
  
  -- Criar perfil
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new_user_id, 'reginaldo.mazaro@ext.medbeauty.com.br', 'Reginaldo Mazaro');
  
  -- Criar role de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin'::app_role);
  
  RAISE NOTICE 'Usuário criado com ID: %', new_user_id;
END $$;

-- Verificar o usuário criado
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'reginaldo.mazaro@medbeauty.com.br';
