-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contracts
CREATE POLICY "Authenticated users can upload contract documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Legal managers can view and update contract documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'legal_manager'))
);
