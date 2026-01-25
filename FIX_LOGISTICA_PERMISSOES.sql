-- FIX_LOGISTICA_PERMISSOES.sql
-- Script de Correção para Pedidos de Logística
-- Objetivo: 
-- 1. Liberar pedidos 'pendentes' (legado) para 'approved'.
-- 2. Garantir que a role 'logistica' exista.

-- 1. Atualizar pedidos travados como 'pending' para 'approved'
-- Isso garante que pedidos criados antes da correção apareçam na tela.
UPDATE marketing_requests
SET status = 'approved'
WHERE status = 'pending';

-- 2. Garantir que a role 'logistica' exista no enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'logistica';

-- 3. INSTRUÇÕES PARA O USUÁRIO (LEIA COM ATENÇÃO)
/*
PARA VER OS PEDIDOS:
--------------------
O sistema usa Row Level Security (RLS). 
Você só verá os pedidos se:
A) Você criou o pedido (status approved, shipped, etc).
B) Você tem o cargo 'logistica' ou 'admin' na tabela user_roles.

Se você está logado com um usuário de teste e NÃO vê os pedidos:
1. Copie seu User ID (UID) no painel de Autenticação do Supabase.
2. Execute o comando abaixo (substituindo SEU_UUID_AQUI):
*/

-- Exemplo (Descomente e substitua o ID para executar):
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('SEU_UUID_AQUI', 'logistica');

/*
Se a tabela user_roles não existir, o script CORRECAO_TABELA_MARKETING.sql precisa ser rodado antes.
*/
