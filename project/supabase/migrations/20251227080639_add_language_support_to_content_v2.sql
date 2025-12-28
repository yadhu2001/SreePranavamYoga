/*
  # Add Multi-Language Support to Content Tables

  1. Changes
    - Add `language_code` column to all content tables
    - Default to 'en' (English) for existing content
    - Add indexes for better query performance

  2. Affected Tables
    - programs
    - courses
    - articles
    - events
    - testimonials
    - teachers
    - faqs
    - solutions
    - feature_sections
    - hero_sections
    - navigation_items
    - about_us_sections
    - about_us_settings
    - locations
    - gallery_collections
    - page_settings

  3. Notes
    - Existing content will be assigned to English ('en')
    - Admin can duplicate and translate content to other languages
    - Queries will filter by language_code to show appropriate content
*/

-- Add language_code to programs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE programs ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_programs_language ON programs(language_code);
  END IF;
END $$;

-- Add language_code to courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE courses ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_courses_language ON courses(language_code);
  END IF;
END $$;

-- Add language_code to articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE articles ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_articles_language ON articles(language_code);
  END IF;
END $$;

-- Add language_code to events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE events ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_events_language ON events(language_code);
  END IF;
END $$;

-- Add language_code to testimonials
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_testimonials_language ON testimonials(language_code);
  END IF;
END $$;

-- Add language_code to teachers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teachers' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE teachers ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_teachers_language ON teachers(language_code);
  END IF;
END $$;

-- Add language_code to faqs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'faqs' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE faqs ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_faqs_language ON faqs(language_code);
  END IF;
END $$;

-- Add language_code to solutions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'solutions' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE solutions ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_solutions_language ON solutions(language_code);
  END IF;
END $$;

-- Add language_code to feature_sections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feature_sections' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE feature_sections ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_feature_sections_language ON feature_sections(language_code);
  END IF;
END $$;

-- Add language_code to hero_sections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_sections' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE hero_sections ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_hero_sections_language ON hero_sections(language_code);
  END IF;
END $$;

-- Add language_code to navigation_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'navigation_items' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE navigation_items ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_navigation_items_language ON navigation_items(language_code);
  END IF;
END $$;

-- Add language_code to about_us_sections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_us_sections' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE about_us_sections ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_about_us_sections_language ON about_us_sections(language_code);
  END IF;
END $$;

-- Add language_code to about_us_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_us_settings' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE about_us_settings ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_about_us_settings_language ON about_us_settings(language_code);
  END IF;
END $$;

-- Add language_code to locations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE locations ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_locations_language ON locations(language_code);
  END IF;
END $$;

-- Add language_code to gallery_collections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_collections' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE gallery_collections ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_gallery_collections_language ON gallery_collections(language_code);
  END IF;
END $$;

-- Add language_code to page_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_settings' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE page_settings ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
    CREATE INDEX idx_page_settings_language ON page_settings(language_code);
  END IF;
END $$;
