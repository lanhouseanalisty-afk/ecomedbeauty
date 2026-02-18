-- SUPABASE SQL EDITOR SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE ACCESS ISSUES

-- 1. Identify your user_id and forcefully insert the ADM role
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM employees WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br' LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Delete any conflicting roles
        DELETE FROM user_roles WHERE user_id = v_user_id;
        
        -- Insert the single correct admin role
        INSERT INTO user_roles (user_id, role, permissions)
        VALUES (v_user_id, 'admin', '{"*"}');
        
        RAISE NOTICE 'ADM role granted to user_id: %', v_user_id;
    ELSE
        RAISE NOTICE 'User not found in employees table.';
    END IF;
END $$;

-- 2. Fix user_roles RLS policies to prevent this lockout in the future
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (SELECT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')));

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
    (SELECT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
)
WITH CHECK (
    (SELECT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
);

-- 3. Ensure the is_admin() function is robust
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
