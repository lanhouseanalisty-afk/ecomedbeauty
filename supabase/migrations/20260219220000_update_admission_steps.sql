-- Update check constraint for admission_processes steps
-- The application uses 'compras' and 'rh_review' steps which were not present in the original constraint.

ALTER TABLE public.admission_processes
DROP CONSTRAINT IF EXISTS admission_processes_current_step_check;

ALTER TABLE public.admission_processes
ADD CONSTRAINT admission_processes_current_step_check
CHECK (current_step IN ('rh', 'gestor', 'compras', 'ti', 'rh_review', 'colaborador', 'concluido'));
