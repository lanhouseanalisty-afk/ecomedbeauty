ALTER TABLE IF EXISTS public.bonus_inventory_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
-- Also we need to make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
-- Let's enable RLS on the objects table if not already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Attempt to create policies. Note: these might throw ignore warnings if they exist, but it's safe to run in supabase.
-- The correct way to handle "IF NOT EXISTS" for policies is complex in plain SQL block without PL/pgSQL block, 
-- but we can drop and recreate to be safe.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (bucket_id = 'images');
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR
INSERT WITH CHECK (
        auth.role() = 'authenticated'
        AND bucket_id = 'images'
    );
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR
UPDATE USING (
        auth.role() = 'authenticated'
        AND bucket_id = 'images'
    );