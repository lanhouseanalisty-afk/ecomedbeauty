-- Fix infinite recursion by forcing SECURITY DEFINER to work (prevent inlining via PLPGSQL)
-- The original function was LANGUAGE SQL, which PostgreSQL can inline into the calling query.
-- When used in an RLS policy on the same table it queries, inlining causes the RLS check
-- to run with the caller's privileges (triggering RLS again), leading to infinite recursion.
-- Switching to PLPGSQL prevents inlining and enforces context switching to the function owner (usually bypass RLS).

-- Drop first to allow parameter name changes (user_id -> _user_id)
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;
