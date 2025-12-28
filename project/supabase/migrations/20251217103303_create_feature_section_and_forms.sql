/*
  # Create Feature Section and Dynamic Forms System

  1. New Tables
    - `feature_sections`
      - `id` (uuid, primary key)
      - `title` (text)
      - `message` (text, rich content)
      - `image_url` (text)
      - `button_text` (text)
      - `button_url` (text)
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `registration_forms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `success_message` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `form_fields`
      - `id` (uuid, primary key)
      - `form_id` (uuid, references registration_forms)
      - `label` (text)
      - `field_type` (text) - text, email, phone, textarea, select, checkbox, radio
      - `placeholder` (text)
      - `options` (jsonb) - for select, checkbox, radio
      - `is_required` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
    
    - `form_submissions`
      - `id` (uuid, primary key)
      - `form_id` (uuid, references registration_forms)
      - `program_id` (uuid, nullable)
      - `course_id` (uuid, nullable)
      - `responses` (jsonb)
      - `submitted_at` (timestamptz)
    
    - `programs` - add form_id column
    - `courses` - add form_id column

  2. Security
    - Enable RLS on all tables
    - Public can submit forms
    - Only authenticated users can manage forms
*/

-- Feature Sections Table
CREATE TABLE IF NOT EXISTS feature_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  button_text text DEFAULT '',
  button_url text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE feature_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active feature sections"
  ON feature_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage feature sections"
  ON feature_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Registration Forms Table
CREATE TABLE IF NOT EXISTS registration_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  success_message text DEFAULT 'Thank you for registering!',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE registration_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active forms"
  ON registration_forms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage forms"
  ON registration_forms FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Form Fields Table
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES registration_forms(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  placeholder text DEFAULT '',
  options jsonb DEFAULT '[]'::jsonb,
  is_required boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view form fields"
  ON form_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM registration_forms
      WHERE registration_forms.id = form_fields.form_id
      AND registration_forms.is_active = true
    )
  );

CREATE POLICY "Authenticated users can manage form fields"
  ON form_fields FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Form Submissions Table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES registration_forms(id) ON DELETE CASCADE,
  program_id uuid DEFAULT NULL,
  course_id uuid DEFAULT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit forms"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Add form_id to programs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'form_id'
  ) THEN
    ALTER TABLE programs ADD COLUMN form_id uuid REFERENCES registration_forms(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add form_id to courses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'form_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN form_id uuid REFERENCES registration_forms(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_feature_sections_active ON feature_sections(is_active, sort_order);
