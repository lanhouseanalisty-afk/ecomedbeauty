-- fix_compras_columns.sql
-- Adiciona colunas de controle do setor Compras na tabela admission_processes

ALTER TABLE public.admission_processes
ADD COLUMN IF NOT EXISTS compras_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compras_completed_by UUID,
ADD COLUMN IF NOT EXISTS compras_remarks TEXT,
ADD COLUMN IF NOT EXISTS vehicle_id UUID,
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS pickup_date DATE,
ADD COLUMN IF NOT EXISTS pickup_time TIME;
