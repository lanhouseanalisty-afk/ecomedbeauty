-- Update status check constraint for contracts table
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check 
CHECK (status IN (
    'requested',        -- Solicitado pelo setor
    'drafting',         -- Jurídico elaborando minuta
    'pending_approval', -- Aguardando aprovação do solicitante
    'legal_review',     -- Análise jurídica final
    'signing',          -- Em assinatura
    'active',           -- Vigente (assinado)
    'archived',         -- Arquivado
    'rejected',         -- Rejeitado
    'terminated',       -- Rescindido
    'expired',          -- Vencido
    'draft'             -- Mantendo compatibilidade legada temporária
));

-- Update existing 'draft' to 'requested' or 'drafting' based on context if need be, 
-- but for now we will just allow 'draft' to exist to not break existing data immediately.
