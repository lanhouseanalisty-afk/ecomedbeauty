-- Adicionar coluna de permissões na tabela user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';

-- Comentário: A senha é gerenciada via auth.users.
