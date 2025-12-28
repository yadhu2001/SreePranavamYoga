/*
  # Create Storage Bucket for Gallery Images

  1. New Storage Bucket
    - `gallery-images` bucket for storing uploaded images
    
  2. Security
    - Public read access for all users
    - Authenticated users can upload files
    - Authenticated users can update/delete their uploads
*/

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read access for gallery images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;
END $$;

-- Allow public read access
CREATE POLICY "Public read access for gallery images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery-images')
  WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-images');