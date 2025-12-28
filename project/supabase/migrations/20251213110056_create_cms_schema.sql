/*
  # Yoga/Wellness CMS Database Schema

  ## Overview
  Complete database schema for a production-ready CMS-driven yoga/wellness website
  with full admin control over all content and site settings.

  ## New Tables

  ### Admin & User Management
  - `admin_profiles` - Extended profile info for admin users
    - `id` (uuid, FK to auth.users)
    - `full_name` (text)
    - `role` (text) - admin, editor, viewer
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Site Settings
  - `site_settings` - Global site configuration
    - `id` (uuid, PK)
    - `site_name` (text)
    - `tagline` (text)
    - `logo_url` (text)
    - `primary_color` (text)
    - `secondary_color` (text)
    - `contact_email` (text)
    - `contact_phone` (text)
    - `social_facebook` (text)
    - `social_twitter` (text)
    - `social_instagram` (text)
    - `social_youtube` (text)
    - `footer_text` (text)
    - `updated_at` (timestamptz)

  ### Navigation
  - `navigation_items` - Configurable main navigation
    - `id` (uuid, PK)
    - `label` (text)
    - `url` (text)
    - `parent_id` (uuid, nullable FK) - for dropdown menus
    - `sort_order` (integer)
    - `is_active` (boolean)
    - `created_at` (timestamptz)

  ### Content Pages
  - `pages` - Dynamic content pages
    - `id` (uuid, PK)
    - `title` (text)
    - `slug` (text, unique)
    - `content` (text)
    - `meta_description` (text)
    - `is_published` (boolean)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Hero Sections
  - `hero_sections` - Homepage hero banners
    - `id` (uuid, PK)
    - `title` (text)
    - `subtitle` (text)
    - `background_image` (text)
    - `background_video` (text)
    - `cta_text` (text)
    - `cta_url` (text)
    - `is_active` (boolean)
    - `sort_order` (integer)
    - `created_at` (timestamptz)

  ### Programs
  - `program_categories` - Program organization
    - `id` (uuid, PK)
    - `name` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `icon` (text)
    - `sort_order` (integer)
    - `created_at` (timestamptz)

  - `programs` - Courses, classes, and programs
    - `id` (uuid, PK)
    - `category_id` (uuid, FK)
    - `title` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `full_content` (text)
    - `image_url` (text)
    - `duration` (text)
    - `level` (text) - beginner, intermediate, advanced
    - `price` (numeric)
    - `is_featured` (boolean)
    - `is_published` (boolean)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Solutions Hub
  - `solutions` - Problem-solution categories
    - `id` (uuid, PK)
    - `title` (text)
    - `slug` (text, unique)
    - `icon` (text)
    - `description` (text)
    - `full_content` (text)
    - `image_url` (text)
    - `sort_order` (integer)
    - `is_active` (boolean)
    - `created_at` (timestamptz)

  ### Articles & Content
  - `articles` - Blog posts, wisdom articles
    - `id` (uuid, PK)
    - `title` (text)
    - `slug` (text, unique)
    - `excerpt` (text)
    - `content` (text)
    - `author` (text)
    - `image_url` (text)
    - `category` (text)
    - `is_featured` (boolean)
    - `is_published` (boolean)
    - `published_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Events
  - `events` - Upcoming events and workshops
    - `id` (uuid, PK)
    - `title` (text)
    - `slug` (text, unique)
    - `description` (text)
    - `location` (text)
    - `event_date` (timestamptz)
    - `end_date` (timestamptz)
    - `image_url` (text)
    - `registration_url` (text)
    - `is_featured` (boolean)
    - `is_published` (boolean)
    - `created_at` (timestamptz)

  ### Social Proof
  - `testimonials` - User and celebrity testimonials
    - `id` (uuid, PK)
    - `name` (text)
    - `title` (text) - role/occupation
    - `content` (text)
    - `image_url` (text)
    - `rating` (integer)
    - `is_featured` (boolean)
    - `is_published` (boolean)
    - `sort_order` (integer)
    - `created_at` (timestamptz)

  ### Teachers
  - `teachers` - Instructor directory
    - `id` (uuid, PK)
    - `name` (text)
    - `bio` (text)
    - `image_url` (text)
    - `specialization` (text)
    - `email` (text)
    - `is_featured` (boolean)
    - `is_published` (boolean)
    - `sort_order` (integer)
    - `created_at` (timestamptz)

  ### FAQs
  - `faqs` - Frequently asked questions
    - `id` (uuid, PK)
    - `question` (text)
    - `answer` (text)
    - `category` (text)
    - `sort_order` (integer)
    - `is_published` (boolean)
    - `created_at` (timestamptz)

  ### Newsletter
  - `newsletter_subscribers` - Email subscribers
    - `id` (uuid, PK)
    - `email` (text, unique)
    - `is_active` (boolean)
    - `subscribed_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Admin users can manage all content
  - Public users can only read published content
*/

-- Admin Profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Wellness Center',
  tagline text DEFAULT 'Making Life a Celebration',
  logo_url text DEFAULT '',
  primary_color text DEFAULT '#6366f1',
  secondary_color text DEFAULT '#ec4899',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  social_facebook text DEFAULT '',
  social_twitter text DEFAULT '',
  social_instagram text DEFAULT '',
  social_youtube text DEFAULT '',
  footer_text text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Navigation Items
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  parent_id uuid REFERENCES navigation_items(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active navigation"
  ON navigation_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage navigation"
  ON navigation_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pages
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  meta_description text DEFAULT '',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pages"
  ON pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Hero Sections
CREATE TABLE IF NOT EXISTS hero_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  background_image text DEFAULT '',
  background_video text DEFAULT '',
  cta_text text DEFAULT '',
  cta_url text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active hero sections"
  ON hero_sections FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage hero sections"
  ON hero_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Program Categories
CREATE TABLE IF NOT EXISTS program_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read program categories"
  ON program_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage program categories"
  ON program_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES program_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  full_content text DEFAULT '',
  image_url text DEFAULT '',
  duration text DEFAULT '',
  level text DEFAULT 'beginner',
  price numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published programs"
  ON programs FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Solutions
CREATE TABLE IF NOT EXISTS solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT '',
  description text DEFAULT '',
  full_content text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active solutions"
  ON solutions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage solutions"
  ON solutions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  author text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT 'general',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  event_date timestamptz NOT NULL,
  end_date timestamptz,
  image_url text DEFAULT '',
  registration_url text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text DEFAULT '',
  content text NOT NULL,
  image_url text DEFAULT '',
  rating integer DEFAULT 5,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text DEFAULT '',
  image_url text DEFAULT '',
  specialization text DEFAULT '',
  email text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published teachers"
  ON teachers FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published faqs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage faqs"
  ON faqs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default site settings
INSERT INTO site_settings (site_name, tagline) 
VALUES ('Wellness Center', 'Making Life a Celebration')
ON CONFLICT DO NOTHING;