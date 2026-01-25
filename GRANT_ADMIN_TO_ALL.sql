-- GRANT_ADMIN_TO_ALL.sql
-- Concede permissão de ADMIN para todos os usuários existentes para facilitar os testes
-- ATENÇÃO: Use apenas em ambiente de desenvolvimento

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Garante que a role 'tech' também exista para garantir
INSERT INTO user_roles (user_id, role)
SELECT id, 'tech'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
