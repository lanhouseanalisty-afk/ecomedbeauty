
-- Add activity tracking and access control to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update profile trigger function if it needs to handle defaults for existing rows
-- (Normally not needed for simple column adds with defaults, but good for completeness)

-- Ensure Admins can update any profile (required for the toggle in Admin page)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);
