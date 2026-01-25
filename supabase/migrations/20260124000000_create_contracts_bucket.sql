-- Create the storage bucket for contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the contracts bucket

-- Set up security policies for the contracts bucket

-- RLS is already enabled on storage.objects by default in Supabase

-- Allow public read access to contracts
CREATE POLICY "Public Access Contracts"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'contracts' );

-- Allow authenticated users to upload contracts
CREATE POLICY "Authenticated Uploads Contracts"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'contracts' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update contracts
CREATE POLICY "Authenticated Updates Contracts"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'contracts' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete contracts
CREATE POLICY "Authenticated Deletes Contracts"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'contracts' AND auth.role() = 'authenticated' );
