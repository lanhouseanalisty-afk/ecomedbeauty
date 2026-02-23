-- Add signer_emails column to legal_contracts
ALTER TABLE public.legal_contracts
ADD COLUMN IF NOT EXISTS signer_emails JSONB DEFAULT '[]'::jsonb;
-- Comment for documentation
COMMENT ON COLUMN public.legal_contracts.signer_emails IS 'List of emails for DocuSign signers';