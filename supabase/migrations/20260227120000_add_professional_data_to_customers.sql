-- Migration to add professional B2B fields to ecommerce_customers
-- and setup storage for professional documents
-- 1. Create Enums if they don't exist
DO $$ BEGIN CREATE TYPE professional_type AS ENUM ('hof', 'med', 'other');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE customer_verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- 2. Add columns to ecommerce_customers
ALTER TABLE public.ecommerce_customers
ADD COLUMN IF NOT EXISTS professional_type professional_type,
    ADD COLUMN IF NOT EXISTS professional_id TEXT,
    ADD COLUMN IF NOT EXISTS professional_state TEXT,
    ADD COLUMN IF NOT EXISTS id_document_url TEXT,
    ADD COLUMN IF NOT EXISTS professional_id_url TEXT,
    ADD COLUMN IF NOT EXISTS diploma_url TEXT,
    ADD COLUMN IF NOT EXISTS verification_status customer_verification_status DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE
SET NULL;
-- 3. Setup Storage Bucket for professional documents
INSERT INTO storage.buckets (id, name, public)
VALUES (
        'professional-documents',
        'professional-documents',
        true
    ) ON CONFLICT (id) DO NOTHING;
-- Storage policies
-- Allow users to upload their own documents
CREATE POLICY "Users can upload their own professional documents" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
        bucket_id = 'professional-documents'
        AND (storage.foldername(name)) [1] = auth.uid()::text
    );
-- Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own professional documents" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'professional-documents'
        AND (storage.foldername(name)) [1] = auth.uid()::text
    );
-- Allow admins/RH to view all documents
CREATE POLICY "Admins and RH can view all professional documents" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'professional-documents'
        AND EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role IN ('admin', 'rh')
        )
    );