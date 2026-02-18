-- Add image_url to bonus_items
ALTER TABLE IF EXISTS public.bonus_items 
ADD COLUMN IF NOT EXISTS image_url TEXT;
