-- ==========================================
-- CORREÇÃO DE RLS PARA EXCLUSÃO DE POSTAGENS
-- ==========================================
-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.employee_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.employee_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.employee_posts;
DROP POLICY IF EXISTS "Everyone can read posts" ON public.employee_posts;
-- 2. Recriar políticas com permissões expandidas
-- Leitura: Todos autenticados podem ver posts
CREATE POLICY "Everyone can read posts" ON public.employee_posts FOR
SELECT USING (true);
-- Inserção: Qualquer usuário autenticado pode postar
CREATE POLICY "Authenticated users can create posts" ON public.employee_posts FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- Atualização: Apenas o autor pode editar
CREATE POLICY "Authors can update own posts" ON public.employee_posts FOR
UPDATE USING (auth.uid() = author_id);
-- Exclusão: Autor, Admin ou o Próprio Dono do Mural (Employee)
CREATE POLICY "Authorized deletion of posts" ON public.employee_posts FOR DELETE USING (
    auth.uid() = author_id -- Autor
    OR public.has_role(auth.uid(), 'admin') -- Administrador
    OR EXISTS (
        -- É o dono do perfil onde o post foi feito
        SELECT 1
        FROM public.employees
        WHERE id = employee_id
            AND user_id = auth.uid()
    )
);
-- Garantir políticas similares no bucket de storage (se necessário)
-- Já coberto na migration anterior, mas vamos reforçar aqui
DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;
CREATE POLICY "Authorized deletion of post media" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'employee-posts'
    AND (
        auth.uid()::text = owner::text -- Próprio autor do arquivo
        OR public.has_role(auth.uid(), 'admin') -- Administrador
    )
);