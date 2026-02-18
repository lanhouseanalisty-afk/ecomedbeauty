-- Add contractor details to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contractor_name TEXT,
ADD COLUMN IF NOT EXISTS contractor_cnpj TEXT,
ADD COLUMN IF NOT EXISTS contractor_address TEXT;
