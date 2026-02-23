-- Migration: Corrigir Visibilidade Social e Feed do Perfil
-- Este script permite que usuários vejam nomes/avatars uns dos outros e garante o JOIN do feed.
-- 1. Melhorar RLS da tabela profiles para uso social
-- Removemos a política restritiva de 'só ver o próprio' para permitir busca pública de info básica
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone authenticated" ON public.profiles FOR
SELECT TO authenticated USING (true);
-- 2. Garantir integridade e JOIN automático no feed
-- Adicionando chaves estrangeiras explícitas de author_id para profiles(id)
-- Isso permite o join .select('*, author:profiles(...)') no Supabase
-- Primeiro, remover referencias antigas para auth.users se exitirem
ALTER TABLE public.employee_posts DROP CONSTRAINT IF EXISTS employee_posts_author_id_fkey;
ALTER TABLE public.employee_posts
ADD CONSTRAINT employee_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE
SET NULL;
-- Mesma coisa para comentários
ALTER TABLE public.employee_post_comments DROP CONSTRAINT IF EXISTS employee_post_comments_author_id_fkey;
ALTER TABLE public.employee_post_comments
ADD CONSTRAINT employee_post_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE
SET NULL;
-- 3. Índice para performance no feed
CREATE INDEX IF NOT EXISTS idx_employee_posts_employee_id ON public.employee_posts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_posts_created_at ON public.employee_posts(created_at DESC);