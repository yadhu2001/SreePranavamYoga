/*
  # Add Vision, Mission, and Core Values to About Us
  
  1. Changes
    - Add `vision` column to `about_us_settings` table
    - Add `mission` column to `about_us_settings` table
    - Add `core_values` column to `about_us_settings` table
  
  2. Notes
    - All three fields store rich HTML content
    - Fields are nullable to allow gradual content addition
    - Existing settings record will be updated with empty defaults
*/

-- Add vision, mission, and core_values columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_us_settings' AND column_name = 'vision'
  ) THEN
    ALTER TABLE about_us_settings ADD COLUMN vision text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_us_settings' AND column_name = 'mission'
  ) THEN
    ALTER TABLE about_us_settings ADD COLUMN mission text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_us_settings' AND column_name = 'core_values'
  ) THEN
    ALTER TABLE about_us_settings ADD COLUMN core_values text DEFAULT '';
  END IF;
END $$;