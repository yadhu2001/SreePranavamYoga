/*
  # Add dimensions to gallery items

  1. Changes
    - Add `width` column to gallery_items (integer, default 400)
    - Add `height` column to gallery_items (integer, default 300)
    - These allow custom sizing of images in the gallery

  2. Notes
    - Existing items will get default dimensions
    - Admins can customize dimensions per image
*/

-- Add width and height columns to gallery_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_items' AND column_name = 'width'
  ) THEN
    ALTER TABLE gallery_items ADD COLUMN width integer DEFAULT 400;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_items' AND column_name = 'height'
  ) THEN
    ALTER TABLE gallery_items ADD COLUMN height integer DEFAULT 300;
  END IF;
END $$;