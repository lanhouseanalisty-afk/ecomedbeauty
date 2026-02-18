-- =====================================================
-- INVESTIGAÇÃO E FIX DE PROVEDOR (SUPABASE)
-- Execute este script no SQL Editor
-- =====================================================

-- 1. Primeiro, vamos ver a verdade absoluta sobre os emails do Denis
SELECT id, email, created_at, last_sign_in_at, raw_app_meta_data->>'provider' as provider
FROM auth.users 
WHERE email LIKE '%denis.ranieri%';

-- 2. Se você quer usar SENHA (denis.ranieri@ext.medbeauty.com.br), 
-- precisamos garantir que ele tem o provedor 'email' vinculado.
-- Vamos resetar tudo para esse email em específico:

UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  encrypted_password = extensions.crypt('MedBeauty@2026', extensions.gen_salt('bf')),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{"full_name":"Denis Ranieri"}'::jsonb,
  updated_at = now()
WHERE email = 'denis.ranieri@ext.medbeauty.com.br';

-- 3. Se houver OUTRO usuário atrapalhando (ex: sem o .ext), 
-- considere deletar o usuário errado no painel do Supabase.
