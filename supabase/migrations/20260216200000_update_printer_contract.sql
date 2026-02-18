-- Migration to UPDATE Printer Contract Requester to "Tech TI"
-- Run this in Supabase SQL Editor.

DO $$
DECLARE
    v_target_user_id UUID;
    v_contract_id UUID;
    v_user_name TEXT;
    v_contract_title TEXT;
BEGIN
    -- 1. SEARCH FOR CONTRACT
    SELECT id, title INTO v_contract_id, v_contract_title
    FROM public.legal_contracts 
    WHERE title ILIKE '%fornecedor de impressoras%' 
       OR title ILIKE '%impressora%'
       OR terms_summary ILIKE '%impressora%'
    LIMIT 1;

    -- 2. SEARCH FOR USER (Tech ti / Tech / Marcelo / TI)
    -- Priority 1: Exact "Tech ti" name matches
    SELECT id, full_name INTO v_target_user_id, v_user_name
    FROM public.profiles
    WHERE full_name ILIKE '%Tech ti%' OR full_name ILIKE '%Tech%'
    LIMIT 1;

    -- Priority 2: If not found, look for IT Manager email in auth.users
    IF v_target_user_id IS NULL THEN
        SELECT id, email INTO v_target_user_id, v_user_name
        FROM auth.users
        WHERE email = 'marcelo.ravagnani@medbeauty.com.br'
        LIMIT 1;
    END IF;

    -- 3. PERFORM UPDATE
    IF v_contract_id IS NOT NULL AND v_target_user_id IS NOT NULL THEN
        UPDATE public.legal_contracts
        SET requester_id = v_target_user_id
        WHERE id = v_contract_id;

        RAISE NOTICE 'SUCCESS: Contract "%" (%) updated to requester "%" (%)', 
                     v_contract_title, v_contract_id, v_user_name, v_target_user_id;
    ELSE
        RAISE NOTICE 'WARNING: Could not update. Contract Found: %, User Found: %', 
                     (v_contract_id IS NOT NULL), (v_target_user_id IS NOT NULL);
    END IF;

END $$;
