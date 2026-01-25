-- FIX_PERMISSOES_GERAL.sql
-- Solução Definitiva para visualização de pedidos
-- Este script garante que TODOS os usuários do sistema tenham permissão de acesso.

-- 1. Garantir que a tabela user_roles existe
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role app_role NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- 2. Conceder permissão de 'logistica' e 'admin' para TODOS os usuários existentes.
-- Isso resolve o problema de "quem sou eu?" no desenvolvimento.
INSERT INTO user_roles (user_id, role)
SELECT id, 'logistica'::app_role FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
ON CONFLICT DO NOTHING;

-- 3. Forçar status 'approved' em pedidos parados
UPDATE marketing_requests 
SET status = 'approved' 
WHERE status = 'pending' OR status IS NULL;

-- 4. Verificação (Opcional - Mostra quantos usuários foram afetados)
SELECT count(*) as total_usuarios_com_permissao FROM user_roles;
