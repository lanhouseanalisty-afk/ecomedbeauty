-- Migration to FIX contract headers (Remove HTML Logo)
-- Run this in your Supabase SQL Editor to clean up the HTML tags.

UPDATE public.contract_templates
SET content = REPLACE(content, '<div style="text-align: center; margin-bottom: 2rem;">
    <img src="/skinstore-logo.png" alt="SKYNSTORE S.A." style="max-height: 80px;" />
</div>

', '')
WHERE active = true;
