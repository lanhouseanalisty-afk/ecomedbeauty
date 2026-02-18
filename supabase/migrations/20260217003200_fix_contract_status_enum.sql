-- Add missing status values to the enum
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'legal_review';
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'drafting';
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'pending_approval';
