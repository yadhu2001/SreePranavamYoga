/*
  # Add Form Support to Events

  1. Changes
    - Add form_id column to events table for linking registration forms
    - Add event_id column to form_submissions to track event registrations
    
  2. Notes
    - Events can now use custom registration forms instead of external URLs
    - form_id is optional (nullable) - events can still use registration_url
    - Allows tracking which event a form submission is for
*/

-- Add form_id column to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'form_id'
  ) THEN
    ALTER TABLE events ADD COLUMN form_id uuid REFERENCES registration_forms(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add event_id column to form_submissions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN event_id uuid DEFAULT NULL;
  END IF;
END $$;