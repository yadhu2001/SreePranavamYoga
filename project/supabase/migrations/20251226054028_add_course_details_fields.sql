/*
  # Add Detailed Fields to Courses Table

  1. New Fields
    - eligibility_criteria (text) - Requirements to enroll in the course
    - age_limit (text) - Age restrictions or requirements
    - course_duration (text) - Length of the course
    - level (text) - Difficulty level (beginner/intermediate/advanced)
    - fees (text) - Course pricing information
    - certification_scope (text) - Certification details and outcomes
    
  2. Notes
    - All fields are optional (nullable)
    - Supports HTML formatting for better display
    - Existing data is preserved
*/

-- Add new fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'eligibility_criteria'
  ) THEN
    ALTER TABLE courses ADD COLUMN eligibility_criteria text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'age_limit'
  ) THEN
    ALTER TABLE courses ADD COLUMN age_limit text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'course_duration'
  ) THEN
    ALTER TABLE courses ADD COLUMN course_duration text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'level'
  ) THEN
    ALTER TABLE courses ADD COLUMN level text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'fees'
  ) THEN
    ALTER TABLE courses ADD COLUMN fees text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'certification_scope'
  ) THEN
    ALTER TABLE courses ADD COLUMN certification_scope text;
  END IF;
END $$;
