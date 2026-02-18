-- Migration to REMOVE text artifacts from contracts
-- Run this in your Supabase SQL Editor to clean up the text.

UPDATE public.contract_templates
SET content = REPLACE(content, '-- HEADER
', '')
WHERE active = true;

UPDATE public.contract_templates
SET content = REPLACE(content, '-- HEADER', '')
WHERE active = true;
