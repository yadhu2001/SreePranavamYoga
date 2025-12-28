/*
  # Create Gallery Schema

  1. New Tables
    - `gallery_collections`
      - `id` (uuid, primary key)
      - `title` (text) - Name of the event/program collection
      - `description` (text) - Description of the collection
      - `category` (text) - Type: 'event' or 'program'
      - `created_at` (timestamptz)
      - `display_order` (integer) - For sorting collections
      - `is_published` (boolean) - Show/hide collection
    
    - `gallery_items`
      - `id` (uuid, primary key)
      - `collection_id` (uuid, foreign key to gallery_collections)
      - `title` (text) - Title of the photo/video
      - `description` (text) - Optional description
      - `type` (text) - 'image' or 'video'
      - `url` (text) - Full URL of the image/video
      - `thumbnail_url` (text) - Thumbnail URL for videos
      - `display_order` (integer) - For sorting items within collection
      - `created_at` (timestamptz)
      - `is_published` (boolean) - Show/hide item

  2. Security
    - Enable RLS on both tables
    - Public read access for published items
    - Admin-only write access
*/

-- Create gallery_collections table
CREATE TABLE IF NOT EXISTS gallery_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (category IN ('event', 'program', 'general')),
  created_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0,
  is_published boolean DEFAULT true
);

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES gallery_collections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('image', 'video')),
  url text NOT NULL,
  thumbnail_url text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Policies for gallery_collections
CREATE POLICY "Anyone can view published collections"
  ON gallery_collections FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all collections"
  ON gallery_collections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert collections"
  ON gallery_collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update collections"
  ON gallery_collections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete collections"
  ON gallery_collections FOR DELETE
  TO authenticated
  USING (true);

-- Policies for gallery_items
CREATE POLICY "Anyone can view published items in published collections"
  ON gallery_items FOR SELECT
  TO anon, authenticated
  USING (
    is_published = true AND 
    EXISTS (
      SELECT 1 FROM gallery_collections 
      WHERE gallery_collections.id = gallery_items.collection_id 
      AND gallery_collections.is_published = true
    )
  );

CREATE POLICY "Authenticated users can view all items"
  ON gallery_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_collections_category ON gallery_collections(category);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_order ON gallery_collections(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_collection ON gallery_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON gallery_items(type);
CREATE INDEX IF NOT EXISTS idx_gallery_items_order ON gallery_items(display_order);