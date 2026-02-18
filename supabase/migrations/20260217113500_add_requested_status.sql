-- Adicionar status 'requested' ao enum contact_status
-- Nota: Em PostgreSQL, não se pode rodar ALTER TYPE ... ADD VALUE dentro de um bloco de transação (DO $$)
-- Mas podemos rodar como um comando simples.

-- Verificando se o tipo existe antes de tentar alterar
-- (Embora o ideal no Supabase seja rodar diretamente no editor SQL)

ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'requested';

-- Garantir que a tabela legal_contracts (se usar esse enum) ou o check constraint aceite
-- Se for um check constraint em vez de ENUM na legal_contracts:
DO $$
BEGIN
    -- Se existir um check constraint bloqueando outros valores na legal_contracts, vamos torná-lo mais flexível
    -- Algumas versões criaram legal_contracts com CHECK constraint em vez de enum nativo
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'legal_contracts_status_check'
    ) THEN
        ALTER TABLE public.legal_contracts DROP CONSTRAINT legal_contracts_status_check;
        ALTER TABLE public.legal_contracts ADD CONSTRAINT legal_contracts_status_check 
        CHECK (status IN ('requested', 'draft', 'legal_review', 'review', 'signing', 'pending_signature', 'active', 'expired', 'terminated', 'renewed'));
    END IF;
END $$;
