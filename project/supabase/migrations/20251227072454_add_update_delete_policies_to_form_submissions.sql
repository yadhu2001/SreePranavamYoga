/*
  # Add Update and Delete Policies to Form Submissions

  1. Changes
    - Add UPDATE policy for authenticated users to edit form submissions
    - Add DELETE policy for authenticated users to delete form submissions
  
  2. Security
    - Only authenticated users (admins) can update and delete submissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_submissions' 
    AND policyname = 'Authenticated users can update submissions'
  ) THEN
    CREATE POLICY "Authenticated users can update submissions"
      ON form_submissions
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_submissions' 
    AND policyname = 'Authenticated users can delete submissions'
  ) THEN
    CREATE POLICY "Authenticated users can delete submissions"
      ON form_submissions
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;
