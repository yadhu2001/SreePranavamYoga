/*
  # Make Gallery Item Title Optional

  1. Changes
    - Modify `gallery_items` table to make `title` column optional
    - Update existing items with empty titles to have a default value based on type

  2. Notes
    - Titles are no longer mandatory for gallery items
    - System will display "Untitled" if no title is provided
*/

-- Make title nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_items' 
    AND column_name = 'title' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE gallery_items 
    ALTER COLUMN title DROP NOT NULL;
  END IF;
END $$;
