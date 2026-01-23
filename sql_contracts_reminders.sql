-- Add reminder configuration to legal_contracts
ALTER TABLE public.legal_contracts 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_email VARCHAR(255);

-- Update existing records if any
UPDATE public.legal_contracts SET reminder_enabled = true WHERE reminder_enabled IS NULL;
