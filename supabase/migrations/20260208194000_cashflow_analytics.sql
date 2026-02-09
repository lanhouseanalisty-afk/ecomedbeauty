
-- Migration: Cashflow Analytics View

CREATE OR REPLACE VIEW public.v_monthly_cashflow AS
WITH monthly_data AS (
  SELECT 
    date_trunc('month', due_date) as month,
    type,
    SUM(total) as amount
  FROM public.invoices
  WHERE status != 'cancelled'
  GROUP BY 1, 2
)
SELECT 
  to_char(month, 'Mon') as name,
  month as sort_month,
  COALESCE(MAX(CASE WHEN type = 'receivable' THEN amount END), 0) as revenue,
  COALESCE(MAX(CASE WHEN type = 'payable' THEN amount END), 0) as expense,
  COALESCE(MAX(CASE WHEN type = 'receivable' THEN amount END), 0) - 
  COALESCE(MAX(CASE WHEN type = 'payable' THEN amount END), 0) as value -- Net Balance
FROM monthly_data
GROUP BY 1, 2
ORDER BY sort_month ASC
LIMIT 6;

-- RLS for the view
ALTER VIEW public.v_monthly_cashflow OWNER TO postgres;
GRANT SELECT ON public.v_monthly_cashflow TO authenticated;
GRANT SELECT ON public.v_monthly_cashflow TO service_role;
