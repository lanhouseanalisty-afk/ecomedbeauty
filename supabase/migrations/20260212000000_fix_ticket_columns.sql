-- Migration: Add missing columns to tickets table
-- Purpose: Support asset linkage and parent-child ticket relationship in the new UI

DO $$ 
BEGIN
    -- 1. Add asset_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'asset_id') THEN
        ALTER TABLE public.tickets ADD COLUMN asset_id UUID REFERENCES public.tech_assets(id);
    END IF;

    -- 2. Add parent_id column if it doesn't exist (for child tickets)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'parent_id') THEN
        ALTER TABLE public.tickets ADD COLUMN parent_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE;
    END IF;

    -- 3. Ensure department and schedule are handled via metadata (no changes needed if using JSONB)
    -- If we decide to promote them to columns later, we can do it here.
    -- For now, TechTicketsPage.tsx uses metadata->'department' and metadata->'preferred_schedule'
END $$;
