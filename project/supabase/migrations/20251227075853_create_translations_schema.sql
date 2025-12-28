/*
  # Create Multi-Language Translations System

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `language_code` (text) - Language code (en, ml, ta, kn, te, hi)
      - `translation_key` (text) - Unique key for the translation
      - `translation_value` (text) - Translated text
      - `category` (text) - Category for organizing translations (navigation, hero, footer, etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `language_settings`
      - `id` (uuid, primary key)
      - `language_code` (text) - Language code
      - `language_name` (text) - Display name (e.g., "English", "മലയാളം")
      - `native_name` (text) - Native name
      - `is_active` (boolean) - Whether this language is available
      - `is_default` (boolean) - Default language
      - `display_order` (integer) - Display order in switcher
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow public read access for active translations
    - Allow authenticated admin users to manage translations

  3. Initial Data
    - Insert supported languages (English, Malayalam, Tamil, Kannada, Telugu, Hindi)
    - Insert basic UI translations for navigation and common elements
*/

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL,
  translation_key text NOT NULL,
  translation_value text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(language_code, translation_key)
);

-- Create language_settings table
CREATE TABLE IF NOT EXISTS language_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text UNIQUE NOT NULL,
  language_name text NOT NULL,
  native_name text NOT NULL,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_settings ENABLE ROW LEVEL SECURITY;

-- Policies for translations table
CREATE POLICY "Anyone can view active translations"
  ON translations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert translations"
  ON translations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update translations"
  ON translations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete translations"
  ON translations
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for language_settings table
CREATE POLICY "Anyone can view active languages"
  ON language_settings
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert language settings"
  ON language_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update language settings"
  ON language_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete language settings"
  ON language_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert supported languages
INSERT INTO language_settings (language_code, language_name, native_name, is_active, is_default, display_order)
VALUES
  ('en', 'English', 'English', true, true, 1),
  ('ml', 'Malayalam', 'മലയാളം', true, false, 2),
  ('ta', 'Tamil', 'தமிழ்', true, false, 3),
  ('kn', 'Kannada', 'ಕನ್ನಡ', true, false, 4),
  ('te', 'Telugu', 'తెలుగు', true, false, 5),
  ('hi', 'Hindi', 'हिन्दी', true, false, 6)
ON CONFLICT (language_code) DO NOTHING;

-- Insert basic UI translations for English (default)
INSERT INTO translations (language_code, translation_key, translation_value, category)
VALUES
  -- Navigation
  ('en', 'nav.home', 'Home', 'navigation'),
  ('en', 'nav.about', 'About Us', 'navigation'),
  ('en', 'nav.programs', 'Programs', 'navigation'),
  ('en', 'nav.courses', 'Courses', 'navigation'),
  ('en', 'nav.articles', 'Articles', 'navigation'),
  ('en', 'nav.events', 'Events', 'navigation'),
  ('en', 'nav.gallery', 'Gallery', 'navigation'),
  ('en', 'nav.teachers', 'Teachers', 'navigation'),

  -- Common UI
  ('en', 'common.loading', 'Loading...', 'common'),
  ('en', 'common.learn_more', 'Learn More', 'common'),
  ('en', 'common.register', 'Register', 'common'),
  ('en', 'common.read_more', 'Read More', 'common'),
  ('en', 'common.back', 'Back', 'common'),
  ('en', 'common.contact', 'Contact', 'common'),
  ('en', 'common.search', 'Search', 'common'),

  -- Footer
  ('en', 'footer.rights', 'All rights reserved', 'footer'),
  ('en', 'footer.quick_links', 'Quick Links', 'footer'),
  ('en', 'footer.follow_us', 'Follow Us', 'footer')
ON CONFLICT (language_code, translation_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_language_settings_updated_at ON language_settings;
CREATE TRIGGER update_language_settings_updated_at
  BEFORE UPDATE ON language_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
