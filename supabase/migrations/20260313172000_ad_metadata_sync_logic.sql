-- Migration: AD Metadata Synchronization Logic
-- Description: Enhances handle_new_user to sync job title, department, and manager from AD claims.
-- Date: 2026-03-13
-- 1. Add column to track manager email from AD if needed (optional but helpful)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS ad_manager_email TEXT;
-- 2. Update handle_new_user to process metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_employee_id UUID;
v_role public.app_role := 'user';
v_full_name TEXT;
v_is_ad BOOLEAN;
-- AD Sync Variables
v_ad_job_title TEXT;
v_ad_dept_name TEXT;
v_ad_manager_email TEXT;
v_ad_hire_date TEXT;
v_dept_id UUID;
v_pos_id UUID;
v_mgr_id UUID;
BEGIN -- Identify if it's an Azure/AD user
v_is_ad := (NEW.raw_app_meta_data->>'provider') = 'azure';
-- Extract AD Metadata (using common Azure AD claim names)
-- Note: These depend on Azure AD "Optional Claims" configuration
v_ad_job_title := NEW.raw_user_meta_data->>'jobTitle';
v_ad_dept_name := NEW.raw_user_meta_data->>'department';
v_ad_manager_email := NEW.raw_user_meta_data->>'manager_email';
-- Custom or mapped
v_ad_hire_date := NEW.raw_user_meta_data->>'extension_hireDate';
-- Try to find the employee by email (case insensitive)
SELECT id,
    full_name,
    department_id,
    position_id INTO v_employee_id,
    v_full_name,
    v_dept_id,
    v_pos_id
FROM public.employees
WHERE LOWER(email) = LOWER(NEW.email)
LIMIT 1;
-- Determine default role
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
INSERT INTO public.user_roles (user_id, role)
VALUES (NEW.id, v_role) ON CONFLICT (user_id, role) DO NOTHING;
-- Process AD Metadata if available
IF v_is_ad
AND v_employee_id IS NOT NULL THEN -- 1. Resolve Department
IF v_ad_dept_name IS NOT NULL THEN -- Use existing mapping function or find direct match
v_dept_id := COALESCE(
    public.get_department_id_from_ad(v_ad_dept_name),
    (
        SELECT id
        FROM public.departments
        WHERE LOWER(name) = LOWER(v_ad_dept_name)
        LIMIT 1
    )
);
END IF;
-- 2. Resolve Position
IF v_ad_job_title IS NOT NULL
AND v_dept_id IS NOT NULL THEN
SELECT id INTO v_pos_id
FROM public.positions
WHERE LOWER(title) = LOWER(v_ad_job_title)
    AND department_id = v_dept_id
LIMIT 1;
-- Auto-create position if it doesn't exist
IF v_pos_id IS NULL THEN
INSERT INTO public.positions (title, department_id, level, is_active)
VALUES (v_ad_job_title, v_dept_id, 1, true)
RETURNING id INTO v_pos_id;
END IF;
END IF;
-- 3. Resolve Manager
IF v_ad_manager_email IS NOT NULL THEN
SELECT id INTO v_mgr_id
FROM public.employees
WHERE LOWER(email) = LOWER(v_ad_manager_email)
LIMIT 1;
END IF;
-- 4. Update Employee Record
UPDATE public.employees
SET user_id = NEW.id,
    ad_object_id = COALESCE(ad_object_id, NEW.raw_user_meta_data->>'sub'),
    department_id = COALESCE(v_dept_id, department_id),
    position_id = COALESCE(v_pos_id, position_id),
    manager_id = COALESCE(v_mgr_id, manager_id),
    ad_manager_email = v_ad_manager_email,
    hire_date = COALESCE(NULLIF(v_ad_hire_date, '')::DATE, hire_date),
    sync_status = 'synced',
    synced_at = NOW(),
    updated_at = NOW()
WHERE id = v_employee_id;
-- Log success
BEGIN PERFORM public.log_ad_sync_event(
    'updated',
    COALESCE(NEW.raw_user_meta_data->>'sub', 'unknown'),
    v_employee_id,
    'success',
    jsonb_build_object(
        'sync_type',
        'metadata',
        'job_title',
        v_ad_job_title,
        'department',
        v_ad_dept_name,
        'manager',
        v_ad_manager_email
    )
);
EXCEPTION
WHEN OTHERS THEN NULL;
END;
ELSIF v_employee_id IS NOT NULL THEN -- Basic link for non-AD users
UPDATE public.employees
SET user_id = NEW.id,
    updated_at = NOW()
WHERE id = v_employee_id;
END IF;
RETURN NEW;
END;
$$;