-- =====================================================
-- PARTE 1: EXPANDIR ENUM app_role
-- =====================================================

-- Primeiro, adicionar os novos valores ao enum existente
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rh_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistics_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'legal_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tech_support';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ecommerce_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auditor';