-- Create the vehicles table for Fleet Management
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model TEXT NOT NULL,
    plate TEXT NOT NULL,
    mileage INTEGER DEFAULT 0,
    location TEXT,
    rental_company TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
    assigned_to_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for now, can be tightened later)
CREATE POLICY "Enable read access for all users" ON public.vehicles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.vehicles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.vehicles
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.vehicles
    FOR DELETE USING (true);
