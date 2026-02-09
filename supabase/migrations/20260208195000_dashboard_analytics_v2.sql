
-- Migration: Dashboard Analytics Views v2

-- 1. Legal Contract Distribution View
CREATE OR REPLACE VIEW public.v_legal_distribution AS
SELECT 
    status as name,
    COUNT(*) as value
FROM public.legal_contracts
GROUP BY status;

-- 2. Logistics Volume Trend View (Last 7 Days)
CREATE OR REPLACE VIEW public.v_logistics_trend AS
WITH date_series AS (
    SELECT generate_series(
        current_date - interval '6 days',
        current_date,
        interval '1 day'
    )::date as day
)
SELECT 
    to_char(ds.day, 'DD/MM') as name,
    COUNT(s.id) as value
FROM date_series ds
LEFT JOIN public.shipments s ON ds.day = s.created_at::date
GROUP BY ds.day
ORDER BY ds.day ASC;

-- 3. RH Department Distribution View
CREATE OR REPLACE VIEW public.v_rh_distribution AS
SELECT 
    d.name as name,
    COUNT(e.id) as value
FROM public.departments d
LEFT JOIN public.employees e ON d.id = e.department_id
WHERE d.is_active = true
GROUP BY d.name
HAVING COUNT(e.id) > 0;

-- Permissions
GRANT SELECT ON public.v_legal_distribution TO authenticated;
GRANT SELECT ON public.v_logistics_trend TO authenticated;
GRANT SELECT ON public.v_rh_distribution TO authenticated;
