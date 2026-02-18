-- Migration to ADD department_id to legal_contracts and Fix Data
-- Run this in Supabase SQL Editor.

BEGIN;

-- 1. ADD COLUMN if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_contracts' AND column_name = 'department_id') THEN
        ALTER TABLE public.legal_contracts 
        ADD COLUMN department_id UUID REFERENCES public.departments(id);
        
        RAISE NOTICE 'Added department_id column.';
    ELSE
        RAISE NOTICE 'Column department_id already exists.';
    END IF;
END $$;

-- 2. POPULATE COLUMN for existing contracts
-- We link the contract to the department of the creator (responsible_id)
UPDATE public.legal_contracts lc
SET department_id = dm.department_id
FROM public.department_members dm
WHERE lc.responsible_id = dm.user_id
  AND lc.department_id IS NULL;

-- 3. SPECIFIC FIX for the "Impressoras" contract if needed
-- (this will be covered by the generic update above if the responsible user is in Tech)

COMMIT;
