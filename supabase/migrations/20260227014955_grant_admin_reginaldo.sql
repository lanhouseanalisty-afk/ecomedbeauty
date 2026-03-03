-- Migration to grant 'admin' role to Reginaldo Mazaro
DO $$
DECLARE v_user_id UUID;
BEGIN -- 1. Find the user ID for Reginaldo
SELECT user_id INTO v_user_id
FROM public.employees
WHERE email ILIKE '%reginaldo.mazaro%'
LIMIT 1;
IF v_user_id IS NOT NULL THEN -- 2. Insert or update the role to 'admin'
INSERT INTO public.user_roles (user_id, role, permissions, updated_at)
VALUES (v_user_id, 'admin', '{}', now()) ON CONFLICT (user_id) DO
UPDATE
SET role = 'admin',
    permissions = '{}',
    updated_at = now();
RAISE NOTICE 'Admin role granted to user %',
v_user_id;
ELSE RAISE NOTICE 'User reginaldo not found';
END IF;
END $$;