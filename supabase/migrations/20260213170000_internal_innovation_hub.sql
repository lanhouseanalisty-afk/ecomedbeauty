
-- 1. Create Idea Bank table
CREATE TABLE IF NOT EXISTS public.internal_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- ex: 'Processo', 'Produto', 'Cultura', 'Tecnologia'
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'analyzing', 'implemented', 'discarded'
    upvotes UUID[] DEFAULT '{}', -- Store user IDs who voted
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enhance employees table for Directory
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- 3. Enable RLS
ALTER TABLE public.internal_ideas ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Idea Bank
CREATE POLICY "Anyone authenticated can read ideas" ON public.internal_ideas
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own ideas" ON public.internal_ideas
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON public.internal_ideas
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 5. Create corporate store orders table (simplified)
CREATE TABLE IF NOT EXISTS public.corporate_store_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'delivered', 'cancelled'
    payment_method TEXT DEFAULT 'payroll_deduction',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.corporate_store_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own store requests" ON public.corporate_store_requests
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "Users can create own store requests" ON public.corporate_store_requests
    FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));
