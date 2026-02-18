
-- Create ingredients table for pricing
CREATE TABLE IF NOT EXISTS public.pricing_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit TEXT NOT NULL, -- kg, L, un, etc.
    cost_per_unit DECIMAL(12,2) NOT NULL DEFAULT 0,
    supplier TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create recipes (composition) table
CREATE TABLE IF NOT EXISTS public.pricing_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES public.pricing_ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(12,4) NOT NULL, -- how much of the ingredient is used in one unit of the product
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, ingredient_id)
);

-- Enable RLS
ALTER TABLE public.pricing_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_recipes ENABLE ROW LEVEL SECURITY;

-- Add policies
-- Admin and Manager have full access
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pricing_ingredients' AND policyname = 'Admin/Manager full access'
    ) THEN
        CREATE POLICY "Admin/Manager full access" ON public.pricing_ingredients 
        FOR ALL TO authenticated 
        USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pricing_recipes' AND policyname = 'Admin/Manager full access'
    ) THEN
        CREATE POLICY "Admin/Manager full access" ON public.pricing_recipes 
        FOR ALL TO authenticated 
        USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
    END IF;
END $$;
