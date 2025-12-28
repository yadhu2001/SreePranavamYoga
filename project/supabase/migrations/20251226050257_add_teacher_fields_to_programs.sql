/*
  # Add Teacher Information to Programs

  1. Changes
    - Add teacher_name field to store the instructor's name
    - Add teacher_qualifications field to store instructor's credentials
    
  2. Notes
    - Fields are nullable to allow programs without assigned teachers
    - Supports HTML formatting in qualifications for better display
*/

-- Add teacher fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'teacher_name'
  ) THEN
    ALTER TABLE programs ADD COLUMN teacher_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'teacher_qualifications'
  ) THEN
    ALTER TABLE programs ADD COLUMN teacher_qualifications text;
  END IF;
END $$;
