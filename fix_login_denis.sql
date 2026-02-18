-- =====================================================
-- FIX DEFINITIVO (v2): CONFIRMAR E-MAIL E RESETAR SENHA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Confirmar o e-mail e Resetar a senha para: MedBeauty@2026
UPDATE auth.users 
SET 
    email_confirmed_at = now(),
    encrypted_password = crypt('MedBeauty@2026', gen_salt('bf')),
    updated_at = now(),
    confirmation_token = '',
    recovery_token = ''
WHERE email = 'denis.ranieri@ext.medbeauty.com.br';

-- 2. Garantir que o perfil existe (Removido 'is_active' que não existe na tabela)
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, 'Denis Ranieri'
FROM auth.users
WHERE email = 'denis.ranieri@ext.medbeauty.com.br'
ON CONFLICT (id) DO NOTHING;

-- 3. Garantir que ele tem a role de usuário
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
WHERE email = 'denis.ranieri@ext.medbeauty.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar resultado
SELECT u.id, u.email, u.email_confirmed_at, p.full_name, ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'denis.ranieri@ext.medbeauty.com.br';
