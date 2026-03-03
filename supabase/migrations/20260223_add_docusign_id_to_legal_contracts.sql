-- Add docusign_id column to legal_contracts
ALTER TABLE public.legal_contracts
ADD COLUMN IF NOT EXISTS docusign_id TEXT;
-- Comment for documentation
COMMENT ON COLUMN public.legal_contracts.docusign_id IS 'DocuSign Envelope ID associated with this contract';