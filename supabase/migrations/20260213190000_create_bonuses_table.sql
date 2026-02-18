-- Create bonuses table
CREATE TABLE IF NOT EXISTS public.bonuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sector TEXT NOT NULL,
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    amount NUMERIC(10, 2) NOT NULL,
    reason TEXT,
    bonus_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can read bonuses" ON public.bonuses
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert bonuses" ON public.bonuses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own created bonuses" ON public.bonuses
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own created bonuses" ON public.bonuses
    FOR DELETE USING (auth.uid() = created_by);

-- Create index for sector for faster filtering
CREATE INDEX IF NOT EXISTS idx_bonuses_sector ON public.bonuses(sector);
