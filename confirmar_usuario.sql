-- =====================================================
-- CONFIRMAR E-MAIL MANUALMENTE NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

UPDATE auth.users 
SET 
    email_confirmed_at = now(),
    updated_at = now(),
    last_sign_in_at = now()
WHERE email = 'denis.ranieri@ext.medbeauty.com.br';

-- Verificar se deu certo
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'denis.ranieri@ext.medbeauty.com.br';
