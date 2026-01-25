-- DEBUG_LOGISTICA.sql
-- Script de Diagnóstico e Correção de Visualização

-- 1. Forçar visualização para TODOS os usuários logados (independente de cargo)
-- Isso elimina qualquer dúvida sobre "cargo incorreto".
DROP POLICY IF EXISTS "Debug View All" ON marketing_requests;
CREATE POLICY "Debug View All" ON marketing_requests FOR SELECT TO authenticated USING (true);

-- 2. Cria um Pedido de TESTE para garantir que existe dados
INSERT INTO marketing_requests (
    request_id, 
    event_name, 
    consultant_name, 
    regional_manager, 
    event_date, 
    kit_type, 
    cep, 
    street, 
    number, 
    neighborhood, 
    city, 
    state, 
    status, 
    created_by
)
VALUES (
    'TESTE-' || floor(random()*10000)::text, 
    'Debug Logística', 
    'Consultora Teste', 
    'Gerente Debug', 
    CURRENT_DATE, 
    'Kit Teste', 
    '01001-000', 'Praça da Sé', '1', 'Centro', 'São Paulo', 'SP', 
    'approved', -- Este status DEVE aparecer na tela
    auth.uid() -- Tenta usar o ID do usuário que roda o script
);

-- 3. Atualizar novamente status nulos ou pendentes
UPDATE marketing_requests 
SET status = 'approved' 
WHERE status IS NULL OR status = 'pending';
