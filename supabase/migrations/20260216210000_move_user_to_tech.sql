-- Migration to MOVE CURRENT USER (You) to Tech Department
-- Run this in Supabase SQL Editor while logged in as yourself.

DO $$
DECLARE
    v_my_user_id UUID;
    v_tech_dept_id UUID;
    v_dept_name TEXT;
BEGIN
    -- 1. GET YOUR USER ID (Running User)
    -- This uses the ID of the user executing the query if in context, otherwise tries to find 'reginaldo'
    -- If running in SQL Editor, auth.uid() might be null or admin.
    -- Let's try to be smart.
    
    -- Option A: You are running this as a Migration, so we need to target specific user.
    -- Since we couldn't find 'reginaldo' easily, let's use the email pattern from file path.
    SELECT id INTO v_my_user_id FROM auth.users WHERE email ILIKE '%reginaldo.mazaro%' LIMIT 1;

    -- Option B: If not found, try generic search
    IF v_my_user_id IS NULL THEN
         SELECT id INTO v_my_user_id FROM auth.users WHERE email ILIKE '%reginaldo%' LIMIT 1;
    END IF;
    
    -- 2. FIND TECH DEPARTMENT
    SELECT id, name INTO v_tech_dept_id, v_dept_name
    FROM public.departments
    WHERE code = 'tech' OR name ILIKE '%Tech%' OR name ILIKE '%TI%'
    LIMIT 1;

    IF v_tech_dept_id IS NULL THEN
        RAISE EXCEPTION 'Department "Tech" not found!';
    END IF;

    IF v_my_user_id IS NULL THEN
         RAISE NOTICE 'Could not auto-detect user "reginaldo". Please check auth.users manually.';
    ELSE
         -- 3. UPDATE DEPARTMENT
         -- Remove from old departments
         DELETE FROM public.department_members WHERE user_id = v_my_user_id;

         -- Add to Tech
         INSERT INTO public.department_members (user_id, department_id, role)
         VALUES (v_my_user_id, v_tech_dept_id, 'manager'); -- Making manager to be safe for permissions

         RAISE NOTICE 'SUCCESS: User % moved to Department %', v_my_user_id, v_dept_name;
    END IF;
END $$;
