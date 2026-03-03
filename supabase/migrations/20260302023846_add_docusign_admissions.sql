-- Migration to support DocuSign integration for Admissions
ALTER TABLE admissions_processes
ADD COLUMN IF NOT EXISTS docusign_envelope_id text,
ADD COLUMN IF NOT EXISTS docusign_status text DEFAULT 'pending';
