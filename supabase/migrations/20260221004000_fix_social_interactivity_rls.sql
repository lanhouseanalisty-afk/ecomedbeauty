-- ==========================================
-- CORREÇÃO DE RLS PARA INTERATIVIDADE (LIKES/COMMENTS)
-- ==========================================
-- 1. Habilitar RLS (garantir)
ALTER TABLE public.employee_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_post_comments ENABLE ROW LEVEL SECURITY;
-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Everyone can read comments" ON public.employee_post_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.employee_post_comments;
DROP POLICY IF EXISTS "Everyone can read likes" ON public.employee_post_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON public.employee_post_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.employee_post_likes;
-- 3. INTERAÇÕES: LEITURA (Público/Autenticado)
CREATE POLICY "Read likes" ON public.employee_post_likes FOR
SELECT USING (true);
CREATE POLICY "Read comments" ON public.employee_post_comments FOR
SELECT USING (true);
-- 4. INTERAÇÕES: INSERÇÃO (Qualquer autenticado)
CREATE POLICY "Insert likes" ON public.employee_post_likes FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert comments" ON public.employee_post_comments FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 5. INTERAÇÕES: EXCLUSÃO (Apenas o próprio autor ou Admin)
CREATE POLICY "Delete likes" ON public.employee_post_likes FOR DELETE USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Delete comments" ON public.employee_post_comments FOR DELETE USING (
    auth.uid() = author_id
    OR public.has_role(auth.uid(), 'admin')
);