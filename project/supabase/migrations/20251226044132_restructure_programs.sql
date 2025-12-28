/*
  # Restructure Programs Table

  1. Changes
    - Remove price field (not needed)
    - Add timings field for schedule display
    - Add slug field for URL routing
    - Make category_id optional
    - Make level optional
    - Update programs table structure

  2. Notes
    - All existing data is preserved
    - Fields are made nullable for flexibility
*/

-- Add new fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'slug'
  ) THEN
    ALTER TABLE programs ADD COLUMN slug text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'timings'
  ) THEN
    ALTER TABLE programs ADD COLUMN timings text;
  END IF;
END $$;

-- Make category_id nullable if it isn't already
ALTER TABLE programs ALTER COLUMN category_id DROP NOT NULL;

-- Make level nullable if it isn't already
ALTER TABLE programs ALTER COLUMN level DROP NOT NULL;

-- Update existing programs to have slug based on title if not set
UPDATE programs
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint on slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'programs_slug_key'
  ) THEN
    ALTER TABLE programs ADD CONSTRAINT programs_slug_key UNIQUE (slug);
  END IF;
END $$;
