-- =====================================================
-- ATUALIZAR SENHA DO USUÁRIO EXISTENTE
-- Execute este script no SQL Editor do projeto NOVO
-- =====================================================

-- Atualizar a senha do usuário existente
UPDATE auth.users
SET encrypted_password = crypt('1qazZAQ!2wsxXSW@', gen_salt('bf')),
    updated_at = now()
WHERE email = 'reginaldo.mazaro@medbeauty.com.br';

-- Verificar se a senha foi atualizada
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.updated_at,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'reginaldo.mazaro@medbeauty.com.br';
