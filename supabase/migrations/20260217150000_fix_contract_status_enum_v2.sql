-- Second fix for contract_status enum to include missing values used in code
-- Specifically 'signing' which was causing invalid input value errors

DO $$
BEGIN
    -- Add 'signing' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'contract_status' AND e.enumlabel = 'signing'
    ) THEN
        ALTER TYPE public.contract_status ADD VALUE 'signing';
    END IF;

    -- Ensure 'legal_review' exists (adding redundancy for safety)
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'contract_status' AND e.enumlabel = 'legal_review'
    ) THEN
        ALTER TYPE public.contract_status ADD VALUE 'legal_review';
    END IF;

    -- Ensure 'requested' exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'contract_status' AND e.enumlabel = 'requested'
    ) THEN
        ALTER TYPE public.contract_status ADD VALUE 'requested';
    END IF;

    -- Ensure 'drafting' exists (sometimes used interchangeably with draft in legacy)
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'contract_status' AND e.enumlabel = 'drafting'
    ) THEN
        ALTER TYPE public.contract_status ADD VALUE 'drafting';
    END IF;
END $$;
