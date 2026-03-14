
-- Create a bucket for property files (PDFs)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-files', 'property-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the bucket
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'property-files' );

CREATE POLICY "Admin Upload" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-files' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin Update" 
  ON storage.objects FOR UPDATE 
  TO authenticated
  USING (
    bucket_id = 'property-files' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin Delete" 
  ON storage.objects FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'property-files' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
