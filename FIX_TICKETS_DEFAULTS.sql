-- FIX_TICKETS_DEFAULTS.sql
-- Correção para o erro de "null value in column ticket_number"

-- 1. Garantir que a sequência existe
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- 2. Garantir que a coluna ticket_number tenha o valor padrão correto
ALTER TABLE tickets 
    ALTER COLUMN ticket_number SET DEFAULT ('TKT-' || lpad(nextval('ticket_number_seq')::text, 6, '0'));

-- 3. (Opcional) Preencher tickets antigos que porventura estejam sem número (se a constraint permitir null temporariamente)
-- Se a constraint for NOT NULL, esse update não faria sentido pois o insert já falhou.
-- Mas caso exista algum dado legado inconsistente:
UPDATE tickets 
SET ticket_number = ('TKT-' || lpad(nextval('ticket_number_seq')::text, 6, '0'))
WHERE ticket_number IS NULL;

-- 4. Verificar se existe constraint NOT NULL e se o default está aplicado.
-- O comando acima (ALTER COLUMN ... SET DEFAULT) resolve para novos inserts.
