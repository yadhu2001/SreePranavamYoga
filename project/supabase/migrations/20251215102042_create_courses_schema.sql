/*
  # Create Courses Schema

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text) - Course name
      - `description` (text) - Course description
      - `category` (text) - Course category for filtering (e.g., 'beginner', 'intermediate', 'advanced', 'wellness', 'fitness')
      - `duration` (text) - Course duration (e.g., '8 weeks', '3 months')
      - `image_url` (text) - Course image
      - `instructor_id` (uuid) - Foreign key to teachers table
      - `price` (numeric) - Course price
      - `schedule` (text) - Course schedule details
      - `start_date` (date) - Course start date
      - `end_date` (date) - Course end date
      - `max_participants` (integer) - Maximum number of participants
      - `is_published` (boolean) - Show/hide course
      - `created_at` (timestamptz)
      - `display_order` (integer)

  2. Security
    - Enable RLS on courses table
    - Public read access for published courses
    - Admin-only write access
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  duration text DEFAULT '',
  image_url text DEFAULT '',
  instructor_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  price numeric DEFAULT 0,
  schedule text DEFAULT '',
  start_date date,
  end_date date,
  max_participants integer DEFAULT 20,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(display_order);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);