-- FINAL RECURSION FIX (ANTI-ERRO 500)
-- Este script remove o loop infinito de segurança do banco.
-- Copie e cole no SQL Editor do Supabase.

-- 1. Limpa todas as regras problemáticas
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Emergency Admin Access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_read" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "emergency_reginaldo_bypass" ON public.user_roles;

-- 2. Cria regras que NÃO causam recursão
-- Regra A: Usuário ler o próprio cargo (Simples)
CREATE POLICY "safe_read_self" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Regra B: "Chave Mestra" (Master Key) via e-mail do JWT (SEM RECURSÃO)
-- Isso não consulta nenhuma tabela, apenas lê quem você é pelo seu login.
CREATE POLICY "master_key_reginaldo" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email')::text = 'reginaldo.mazaro@ext.medbeauty.com.br'
)
WITH CHECK (
  (auth.jwt() ->> 'email')::text = 'reginaldo.mazaro@ext.medbeauty.com.br'
);

-- 3. Reativa a segurança de forma estável
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Garante que seu Cargo de ADM esteja gravado corretamente
DELETE FROM public.user_roles 
WHERE user_id IN (
    SELECT user_id FROM public.employees 
    WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br'
);

INSERT INTO public.user_roles (user_id, role, permissions)
SELECT user_id, 'admin', '{"*"}'
FROM public.employees 
WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br';
