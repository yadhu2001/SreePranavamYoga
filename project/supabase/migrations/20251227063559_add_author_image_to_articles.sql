/*
  # Add Author Image to Articles

  1. Changes
    - Add author_image column to articles table for displaying author photo
    - Column is optional (nullable) with default empty string
    
  2. Notes
    - Allows articles to display author photo alongside author name
    - Existing articles will have empty author_image by default
*/

-- Add author_image column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'author_image'
  ) THEN
    ALTER TABLE articles ADD COLUMN author_image text DEFAULT '';
  END IF;
END $$;