-- ==========================================
-- CORREÇÃO DE RLS SIMPLIFICADA PARA TESTE
-- ==========================================
-- Remover todas as políticas de exclusão anteriores para evitar conflitos
DROP POLICY IF EXISTS "Authorized deletion of posts" ON public.employee_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.employee_posts;
-- Política ULTRA-SIMPLIFICADA para garantir que funcione se o usuário estiver autenticado
-- e for o dono ou admin (usando verificação direta na tabela roles)
CREATE POLICY "Authorized deletion of posts v2" ON public.employee_posts FOR DELETE USING (
    auth.uid() = author_id -- Próprio autor
    OR EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
            AND role::text = 'admin'
    ) -- Administrador (com cast para text para evitar erros de enum)
    OR EXISTS (
        SELECT 1
        FROM public.employees
        WHERE id = employee_posts.employee_id
            AND user_id = auth.uid()
    ) -- Dono do perfil
);