-- Migration: Create and Seed Permissions Table
-- Created manually to fix missing table issue

-- 1. Ensure Roles Exist (Idempotent)
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

-- 2. Create Table if not exists
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

-- 2. Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow admins to do everything
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow users to read (if needed by frontend, though usually restricted to admin)
-- For the Admin Page, only admins access it.
-- But let's allow read for authenticated users just in case logic changes, or restrict to admin.
-- Safest is Admin only for now as it exposes system structure.

-- 4. Seed Data
TRUNCATE TABLE public.permissions;

-- Admin: All Access
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
SELECT 
  'admin'::app_role, 
  m::app_module, 
  true, true, true, true
FROM unnest(ARRAY['admin', 'rh', 'financeiro', 'marketing', 'comercial', 'logistica', 'juridico', 'tech', 'ecommerce']) AS m;

-- RH Manager
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES 
('rh_manager'::app_role, 'rh'::app_module, true, true, true, true),
('rh_manager'::app_role, 'admin'::app_module, false, false, false, false);

-- Finance Manager
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES ('finance_manager'::app_role, 'financeiro'::app_module, true, true, true, true);

-- Marketing Manager
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES ('marketing_manager'::app_role, 'marketing'::app_module, true, true, true, true);

-- Sales Manager
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES ('sales_manager'::app_role, 'comercial'::app_module, true, true, true, true);

-- Logistics Manager
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES ('logistics_manager'::app_role, 'logistica'::app_module, true, true, true, true);

-- Tech Support
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES 
('tech_support'::app_role, 'tech'::app_module, true, true, true, true),
('tech_support'::app_role, 'admin'::app_module, true, false, false, false);

-- Ecommerce Manager
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES ('ecommerce_manager'::app_role, 'ecommerce'::app_module, true, true, true, true);

-- User (Basic)
INSERT INTO public.permissions (role, module, can_read, can_create, can_update, can_delete)
SELECT 
  'user'::app_role, 
  m::app_module, 
  true, false, false, false
FROM unnest(ARRAY['rh', 'marketing', 'comercial', 'tech']) AS m;
