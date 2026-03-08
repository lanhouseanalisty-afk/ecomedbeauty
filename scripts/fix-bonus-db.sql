-- 1. Create the Storage Bucket for Images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
-- 2. Create the Table 'bonus_inventory_items' (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.bonus_inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. In case the table existed but didn't have the image_url column, add it
ALTER TABLE IF EXISTS public.bonus_inventory_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
-- 4. Enable RLS on the table
ALTER TABLE public.bonus_inventory_items ENABLE ROW LEVEL SECURITY;
-- 5. Policies for bonus_inventory_items
DROP POLICY IF EXISTS "Everyone can read items" ON public.bonus_inventory_items;
CREATE POLICY "Everyone can read items" ON public.bonus_inventory_items FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage items" ON public.bonus_inventory_items;
CREATE POLICY "Authenticated users can manage items" ON public.bonus_inventory_items FOR ALL USING (auth.role() = 'authenticated');