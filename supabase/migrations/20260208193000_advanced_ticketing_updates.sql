
-- Migration: Advanced Ticketing Updates (SLA, Assets, Audit)

-- 1. Add asset linkage to tickets
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.tech_assets(id);

-- 2. Create ticket history table for auditing
CREATE TABLE IF NOT EXISTS public.ticket_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'status_change', 'assignment_change', 'priority_change', 'note_added', etc.
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for history
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view history of tickets they can see"
ON public.ticket_history FOR SELECT
USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id));

-- 3. SLA Calculation Trigger
CREATE OR REPLACE FUNCTION public.calculate_ticket_sla()
RETURNS TRIGGER AS $$
DECLARE
    v_sla_hours INT;
BEGIN
    -- Get SLA resolution hours from category
    SELECT sla_resolution_hours INTO v_sla_hours
    FROM public.ticket_categories
    WHERE id = NEW.category_id;

    -- Default to 72 hours if no category or SLA defined
    IF v_sla_hours IS NULL THEN
        v_sla_hours := 72;
    END IF;

    -- Set SLA due date if not already set or if category changed
    IF (TG_OP = 'INSERT') OR (NEW.category_id IS DISTINCT FROM OLD.category_id) THEN
        NEW.sla_resolution_due := NEW.created_at + (v_sla_hours || ' hours')::interval;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_calculate_ticket_sla
BEFORE INSERT OR UPDATE ON public.tickets
FOR EACH ROW EXECUTE PROCEDURE public.calculate_ticket_sla();

-- 4. Audit Logging Trigger
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status change
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO public.ticket_history (ticket_id, user_id, action, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'status_change', OLD.status::text, NEW.status::text);
    END IF;

    -- Log assignment change
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
        INSERT INTO public.ticket_history (ticket_id, user_id, action, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'assignment_change', OLD.assigned_to::text, NEW.assigned_to::text);
    END IF;

    -- Log priority change
    IF NEW.priority IS DISTINCT FROM OLD.priority THEN
        INSERT INTO public.ticket_history (ticket_id, user_id, action, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'priority_change', OLD.priority::text, NEW.priority::text);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_log_ticket_changes
AFTER UPDATE ON public.tickets
FOR EACH ROW EXECUTE PROCEDURE public.log_ticket_changes();
