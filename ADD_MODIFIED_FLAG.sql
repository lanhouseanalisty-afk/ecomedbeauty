-- Add modified_after_admission flag to tech_assets
ALTER TABLE public.tech_assets ADD COLUMN IF NOT EXISTS modified_after_admission BOOLEAN DEFAULT false;

-- Update existing assets to false just in case
UPDATE public.tech_assets SET modified_after_admission = false WHERE modified_after_admission IS NULL;
