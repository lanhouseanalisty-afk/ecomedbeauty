-- Migration: Automated AD and Employee Association
-- Description: Automatically links new Auth users to existing employees by email and assigns 'analyst' role to AD users.
-- Date: 2026-03-13
-- 1. Ensure the 'analyst' role exists in the app_role enum
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role'
        AND e.enumlabel = 'analyst'
) THEN ALTER TYPE public.app_role
ADD VALUE 'analyst';
END IF;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- 2. Enhance the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_employee_id UUID;
v_role public.app_role := 'user';
v_full_name TEXT;
v_is_ad BOOLEAN;
BEGIN -- Identify if it's an Azure/AD user
v_is_ad := (NEW.raw_app_meta_data->>'provider') = 'azure';
-- Try to find the employee by email (case insensitive)
SELECT id,
    full_name INTO v_employee_id,
    v_full_name
FROM public.employees
WHERE LOWER(email) = LOWER(NEW.email)
LIMIT 1;
-- Determine default role
-- If we found an employee record OR it's an AD account, we use 'analyst' as a better corporate default
IF v_employee_id IS NOT NULL
OR v_is_ad THEN v_role := 'analyst';
END IF;
-- Create or Update Profile
INSERT INTO public.profiles (id, email, full_name)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            v_full_name
        )
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
-- Assign Role
-- Note: Role 'user' or 'analyst' is assigned only if no role exists yet
INSERT INTO public.user_roles (user_id, role)
VALUES (NEW.id, v_role) ON CONFLICT (user_id, role) DO NOTHING;
-- Link Employee record to Auth user
IF v_employee_id IS NOT NULL THEN
UPDATE public.employees
SET user_id = NEW.id,
    ad_object_id = COALESCE(ad_object_id, NEW.raw_user_meta_data->>'sub'),
    sync_status = 'synced',
    synced_at = NOW(),
    updated_at = NOW()
WHERE id = v_employee_id;
-- Log the association event if it was an AD login
IF v_is_ad THEN -- Check if log function exists before calling (safety check)
BEGIN PERFORM public.log_ad_sync_event(
    'updated',
    COALESCE(NEW.raw_user_meta_data->>'sub', 'unknown'),
    v_employee_id,
    'success',
    jsonb_build_object(
        'message',
        'Automated link during login',
        'user_id',
        NEW.id
    )
);
EXCEPTION
WHEN OTHERS THEN -- If logging fails, we don't want to break the entire login flow
NULL;
END;
END IF;
END IF;
RETURN NEW;
END;
$$;
-- Trigger normally doesn't need to be recreated if the function name remains the same,
-- but we ensure it's active.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();