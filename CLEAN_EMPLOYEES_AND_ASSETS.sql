-- CLEAN_EMPLOYEES_AND_ASSETS.sql
-- Este script remove todos os registros de funcionários e ativos tech para permitir uma nova sincronização limpa.

-- 1. Desabilita temporariamente os triggers se necessário (opcional)
-- 2. Remove todos os ativos de tecnologia
DELETE FROM public.tech_assets;

-- 3. Remove todos os registros de frequência/ponto (dependência de funcionários)
DELETE FROM public.attendance;

-- 4. Remove todas as solicitações de férias/licença (dependência de funcionários)
DELETE FROM public.leave_requests;

-- 5. Remove participantes de treinamentos (dependência de funcionários)
DELETE FROM public.training_participants;

-- 6. Remove processos de desligamento (dependência de funcionários)
DELETE FROM public.termination_processes;

-- 7. Remove posts e interações do perfil (dependência de funcionários)
DELETE FROM public.employee_posts;

-- 8. Limpa a tabela de funcionários
-- Nota: Usamos DELETE em vez de TRUNCATE para evitar problemas com chaves estrangeiras complexas
DELETE FROM public.employees;

-- Opcional: Se quiser resetar os IDs sequenciais (se houver)
-- ALTER SEQUENCE employees_id_seq RESTART WITH 1;
