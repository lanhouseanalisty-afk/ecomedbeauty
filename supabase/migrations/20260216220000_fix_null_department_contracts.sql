-- Migration to FIX NULL DEPARTMENTS (Corrected)
-- Run this in Supabase SQL Editor.

DO $$
DECLARE
    v_tech_dept_id UUID;
BEGIN
    -- 1. FIND TECH DEPARTMENT
    SELECT id INTO v_tech_dept_id
    FROM public.departments
    WHERE code = 'tech' OR name ILIKE '%Tech%' OR name ILIKE '%TI%'
    LIMIT 1;

    -- 2. UPDATE ORPHAN CONTRACTS
    -- Updates contracts created by users who are in Tech but have NULL department_id
    -- Uses 'responsible_id' as the requester/creator field.
    
    UPDATE public.legal_contracts lc
    SET department_id = v_tech_dept_id
    FROM public.department_members dm
    WHERE lc.responsible_id = dm.user_id
      AND dm.department_id = v_tech_dept_id
      AND lc.department_id IS NULL;

    RAISE NOTICE 'Fixed orphan contracts for Tech members.';

END $$;
