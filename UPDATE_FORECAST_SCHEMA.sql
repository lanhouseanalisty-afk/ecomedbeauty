
-- Adicionar coluna de meta diária na tabela de lançamentos
ALTER TABLE lancamentos_diarios 
ADD COLUMN IF NOT EXISTS valor_meta DECIMAL(18,2);

-- Atualizar auditoria se necessário (opcional, JSON aceita tudo)
