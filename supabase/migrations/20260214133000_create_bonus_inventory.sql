-- Drop old table
DROP TABLE IF EXISTS public.bonuses;

-- Create Items Inventory Table
CREATE TABLE IF NOT EXISTS public.bonus_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Usage Records Table
CREATE TABLE IF NOT EXISTS public.bonus_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES public.bonus_items(id),
    sector TEXT NOT NULL,
    sales_order TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    manager_auth BOOLEAN DEFAULT false,
    registered_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bonus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_usage ENABLE ROW LEVEL SECURITY;

-- Policies for Items
CREATE POLICY "Everyone can read items" ON public.bonus_items 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage items" ON public.bonus_items 
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for Usage
CREATE POLICY "Everyone can read usage" ON public.bonus_usage 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert usage" ON public.bonus_usage 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to decrement stock on usage
CREATE OR REPLACE FUNCTION public.handle_bonus_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.bonus_items
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for stock decrement
CREATE TRIGGER on_bonus_usage_created
    AFTER INSERT ON public.bonus_usage
    FOR EACH ROW EXECUTE FUNCTION public.handle_bonus_usage();
