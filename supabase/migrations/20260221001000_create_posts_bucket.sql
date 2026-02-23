-- Create storage bucket for employee posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-posts', 'employee-posts', true) ON CONFLICT (id) DO NOTHING;
-- Storage policies for employee posts
CREATE POLICY "Post images are publicly accessible" ON storage.objects FOR
SELECT USING (bucket_id = 'employee-posts');
CREATE POLICY "Users can upload post media" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'employee-posts');
CREATE POLICY "Users can update their own post media" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'employee-posts'
        AND auth.uid()::text = owner::text
    );
CREATE POLICY "Users can delete their own post media" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'employee-posts'
    AND auth.uid()::text = owner::text
);