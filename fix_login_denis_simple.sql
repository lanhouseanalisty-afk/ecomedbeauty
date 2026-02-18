-- =====================================================
-- FIX SIMPLIFICADO: APENAS SENHA E CONFIRMAÇÃO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

UPDATE auth.users 
SET 
    email_confirmed_at = now(),
    encrypted_password = extensions.crypt('MedBeauty@2026', extensions.gen_salt('bf')),
    updated_at = now(),
    confirmation_token = '',
    recovery_token = ''
WHERE email = 'denis.ranieri@ext.medbeauty.com.br';

-- Após rodar, verifique se aparece "Success: 1 row(s) updated" no Supabase.
