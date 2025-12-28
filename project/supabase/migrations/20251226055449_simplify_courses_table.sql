/*
  # Simplify Courses Table

  1. Changes
    - Remove unnecessary fields (instructor_id, price, schedule, start_date, end_date, max_participants, duration, form_id, category)
    - Keep only essential fields:
      - id, title, description
      - eligibility_criteria, age_limit, course_duration, level, fees, certification_scope
      - image_url
      - is_published, display_order
      - created_at, updated_at
    
  2. Notes
    - All new fields remain optional
    - Simplified structure focuses on course information only
*/

-- Add updated_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE courses ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Remove unnecessary columns (if they exist)
DO $$
BEGIN
  -- Remove instructor_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'instructor_id'
  ) THEN
    ALTER TABLE courses DROP COLUMN instructor_id;
  END IF;

  -- Remove price
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'price'
  ) THEN
    ALTER TABLE courses DROP COLUMN price;
  END IF;

  -- Remove schedule
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'schedule'
  ) THEN
    ALTER TABLE courses DROP COLUMN schedule;
  END IF;

  -- Remove start_date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE courses DROP COLUMN start_date;
  END IF;

  -- Remove end_date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE courses DROP COLUMN end_date;
  END IF;

  -- Remove max_participants
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE courses DROP COLUMN max_participants;
  END IF;

  -- Remove duration
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'duration'
  ) THEN
    ALTER TABLE courses DROP COLUMN duration;
  END IF;

  -- Remove form_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'form_id'
  ) THEN
    ALTER TABLE courses DROP COLUMN form_id;
  END IF;

  -- Remove category
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'category'
  ) THEN
    ALTER TABLE courses DROP COLUMN category;
  END IF;
END $$;
