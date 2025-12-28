/*
  # Create About Us Schema

  1. New Tables
    - `about_us_sections`
      - `id` (uuid, primary key)
      - `title` (text) - Section title (e.g., "Our Mission", "Our Vision")
      - `content` (text) - Rich HTML content
      - `image_url` (text, nullable) - Optional image for the section
      - `display_order` (integer) - Order of appearance
      - `is_published` (boolean) - Visibility control
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `about_us_settings`
      - `id` (uuid, primary key)
      - `hero_title` (text) - Main heading on About Us page
      - `hero_subtitle` (text) - Subtitle text
      - `hero_image_url` (text, nullable) - Hero section image
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access for published content
    - Authenticated users can manage content
*/

-- Create about_us_sections table
CREATE TABLE IF NOT EXISTS about_us_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create about_us_settings table
CREATE TABLE IF NOT EXISTS about_us_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL DEFAULT 'About Us',
  hero_subtitle text NOT NULL DEFAULT 'Learn more about our wellness center',
  hero_image_url text,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO about_us_settings (hero_title, hero_subtitle)
VALUES ('About Us', 'Learn more about our wellness center and what we stand for')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE about_us_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published about sections" ON about_us_sections;
  DROP POLICY IF EXISTS "Authenticated users can manage about sections" ON about_us_sections;
  DROP POLICY IF EXISTS "Public can view about settings" ON about_us_settings;
  DROP POLICY IF EXISTS "Authenticated users can manage about settings" ON about_us_settings;
END $$;

-- Policies for about_us_sections
CREATE POLICY "Public can view published about sections"
  ON about_us_sections FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage about sections"
  ON about_us_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for about_us_settings
CREATE POLICY "Public can view about settings"
  ON about_us_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage about settings"
  ON about_us_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);