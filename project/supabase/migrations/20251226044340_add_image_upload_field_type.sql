/*
  # Add Image Upload Field Type Support

  1. Changes
    - Adds support for image/file upload field types in registration forms
    - This allows admins to create fields where users can upload files (like Aadhar cards)

  2. Notes
    - No schema changes needed - the field_type column already supports any string value
    - This migration serves as documentation that 'image' is now a valid field_type
*/

-- No actual changes needed, existing schema supports the 'image' field type
-- This migration exists for documentation purposes
SELECT 1;
