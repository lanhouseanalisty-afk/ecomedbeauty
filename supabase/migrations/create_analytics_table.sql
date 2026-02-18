-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('identify', 'track', 'page')),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    properties JSONB DEFAULT '{}'::jsonb,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert events
CREATE POLICY "Authenticated users can insert events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Only admins can view events
CREATE POLICY "Admins can view all events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Index for faster querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
