-- FIX_PROFILES_ACCESS.sql
-- Libera o acesso de leitura a todos os perfis para que o nome do autor apareça nas postagens.

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT 
USING (true);

-- Também garante que campos básicos do colaborador possam ser lidos (para o join de posts)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
