-- Fix Permissions Access & Re-Seed

-- 0. Ensure Roles Exist (Idempotent)
DO $$ 
BEGIN
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'rh_manager';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'finance_manager';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'marketing_manager';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'sales_manager';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'logistics_manager';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'tech_support';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ecommerce_manager';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role app_role NOT NULL,
    module app_module NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role, module)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Add Permissive Read Policy (For Debug/Fix)
DROP POLICY IF EXISTS "Allow authenticated to read permissions" ON public.permissions;
CREATE POLICY "Allow authenticated to read permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

-- Ensure Admin Write Access
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Re-Seed Data (Upsert to avoid duplicates)
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES 
  ('admin'::app_role, 'admin'::app_module, true, true, true, true),
  ('admin'::app_role, 'rh'::app_module, true, true, true, true),
  ('admin'::app_role, 'financeiro'::app_module, true, true, true, true),
  ('admin'::app_role, 'marketing'::app_module, true, true, true, true),
  ('admin'::app_role, 'comercial'::app_module, true, true, true, true),
  ('admin'::app_role, 'logistica'::app_module, true, true, true, true),
  ('admin'::app_role, 'juridico'::app_module, true, true, true, true),
  ('admin'::app_role, 'tech'::app_module, true, true, true, true),
  ('admin'::app_role, 'ecommerce'::app_module, true, true, true, true),
  
  ('rh_manager'::app_role, 'rh'::app_module, true, true, true, true),
  ('finance_manager'::app_role, 'financeiro'::app_module, true, true, true, true),
  ('marketing_manager'::app_role, 'marketing'::app_module, true, true, true, true),
  ('sales_manager'::app_role, 'comercial'::app_module, true, true, true, true),
  ('logistics_manager'::app_role, 'logistica'::app_module, true, true, true, true),
  ('tech_support'::app_role, 'tech'::app_module, true, true, true, true),
  ('ecommerce_manager'::app_role, 'ecommerce'::app_module, true, true, true, true)
ON CONFLICT (role, module) DO UPDATE SET
  can_read = EXCLUDED.can_read,
  can_create = EXCLUDED.can_create,
  can_update = EXCLUDED.can_update,
  can_delete = EXCLUDED.can_delete;
