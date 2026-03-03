-- Create table for global date notes
CREATE TABLE IF NOT EXISTS public.forecast_daily_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE UNIQUE NOT NULL,
    nota TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.forecast_daily_notes ENABLE ROW LEVEL SECURITY;
-- Allow read for authenticated
CREATE POLICY "Auth read forecast_daily_notes" ON public.forecast_daily_notes FOR
SELECT USING (auth.role() = 'authenticated');
-- Allow all for admin, managers
CREATE POLICY "Manage forecast_daily_notes" ON public.forecast_daily_notes FOR ALL USING (
    exists (
        select 1
        from user_roles
        where user_id = auth.uid()
            and role in ('admin', 'sales_manager', 'finance_manager')
    )
);