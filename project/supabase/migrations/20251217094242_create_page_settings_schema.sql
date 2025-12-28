/*
  # Create Page Settings Schema

  ## Overview
  This migration creates a table to store all editable text content across the website pages.
  This allows administrators to edit any text on the site without modifying code.

  ## New Tables
  
  ### `page_settings`
  Stores all editable text content organized by page and key
  - `id` (uuid, primary key) - Unique identifier
  - `page` (text) - Page identifier (home, programs, teachers, articles, etc.)
  - `key` (text) - Setting key (heading, subheading, button_text, etc.)
  - `value` (text) - The actual text content
  - `description` (text) - Helper text explaining what this setting controls
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `page_settings` table
  - Add policy for public read access (everyone can view the text)
  - Add policy for authenticated admin update access

  ## Initial Data
  Seeds the table with all current hardcoded text from the site
*/

-- Create page_settings table
CREATE TABLE IF NOT EXISTS page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, key)
);

-- Enable RLS
ALTER TABLE page_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read page settings
CREATE POLICY "Anyone can read page settings"
  ON page_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update page settings
CREATE POLICY "Authenticated users can update page settings"
  ON page_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert page settings
CREATE POLICY "Authenticated users can insert page settings"
  ON page_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete page settings
CREATE POLICY "Authenticated users can delete page settings"
  ON page_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default page settings for Home page
INSERT INTO page_settings (page, key, value, description) VALUES
  ('home', 'featured_programs_heading', 'Featured Programs', 'Main heading for featured programs section'),
  ('home', 'featured_programs_subheading', 'Transform your life with our expertly designed programs', 'Subheading for featured programs section'),
  ('home', 'testimonials_heading', 'What Our Students Say', 'Main heading for testimonials section'),
  ('home', 'testimonials_subheading', 'Real transformations from real people', 'Subheading for testimonials section'),
  ('home', 'faqs_heading', 'Frequently Asked Questions', 'Main heading for FAQs section'),
  ('home', 'faqs_subheading', 'Get answers to common questions', 'Subheading for FAQs section'),
  ('home', 'view_all_programs_button', 'View All Programs', 'Button text for viewing all programs'),
  ('home', 'learn_more_button', 'Learn More', 'Button text for learning more');

-- Insert default page settings for Hero section
INSERT INTO page_settings (page, key, value, description) VALUES
  ('hero', 'solutions_heading', 'Find a solution for...', 'Heading above solution bubbles');

-- Insert default page settings for Programs page
INSERT INTO page_settings (page, key, value, description) VALUES
  ('programs', 'page_heading', 'Our Programs', 'Main page heading'),
  ('programs', 'page_subheading', 'Discover transformative programs designed to enhance your wellbeing', 'Page subheading'),
  ('programs', 'filter_heading', 'Filter Programs', 'Filter section heading'),
  ('programs', 'category_label', 'Category', 'Category filter label'),
  ('programs', 'level_label', 'Level', 'Level filter label'),
  ('programs', 'all_categories', 'All Categories', 'All categories filter option'),
  ('programs', 'all_levels', 'All Levels', 'All levels filter option'),
  ('programs', 'level_beginner', 'Beginner', 'Beginner level option'),
  ('programs', 'level_intermediate', 'Intermediate', 'Intermediate level option'),
  ('programs', 'level_advanced', 'Advanced', 'Advanced level option'),
  ('programs', 'no_programs_message', 'No programs found matching your criteria.', 'Message when no programs match filters'),
  ('programs', 'learn_more_button', 'Learn More', 'Learn more button text');

-- Insert default page settings for Teachers page
INSERT INTO page_settings (page, key, value, description) VALUES
  ('teachers', 'page_heading', 'Our Teachers', 'Main page heading'),
  ('teachers', 'page_subheading', 'Meet our experienced and dedicated instructors who are passionate about guiding you on your wellness journey', 'Page subheading'),
  ('teachers', 'no_teachers_heading', 'No Teachers Available', 'Heading when no teachers are available'),
  ('teachers', 'no_teachers_message', 'Check back soon to meet our instructors!', 'Message when no teachers are available'),
  ('teachers', 'specialties_label', 'Specialties', 'Label for teacher specialties'),
  ('teachers', 'contact_teacher_button', 'Contact Teacher', 'Contact teacher button text'),
  ('teachers', 'loading_message', 'Loading teachers...', 'Loading state message');

-- Insert default page settings for Articles page
INSERT INTO page_settings (page, key, value, description) VALUES
  ('articles', 'page_heading', 'Wisdom & Insights', 'Main page heading'),
  ('articles', 'page_subheading', 'Explore articles on wellness, mindfulness, and personal growth', 'Page subheading'),
  ('articles', 'featured_label', 'Featured Article', 'Label for featured article'),
  ('articles', 'read_article_button', 'Read Article', 'Read full article button text'),
  ('articles', 'read_more_button', 'Read More', 'Read more button text for article cards');

-- Insert default page settings for Events page
INSERT INTO page_settings (page, key, value, description) VALUES
  ('events', 'page_heading', 'Upcoming Events', 'Main page heading'),
  ('events', 'page_subheading', 'Join us for transformative workshops, retreats, and celebrations', 'Page subheading'),
  ('events', 'featured_badge', 'Featured Event', 'Badge text for featured events'),
  ('events', 'upcoming_badge', 'Upcoming', 'Badge text for upcoming events'),
  ('events', 'register_button', 'Register Now', 'Register button text'),
  ('events', 'no_events_message', 'No upcoming events at this time. Check back soon!', 'Message when no events are available');

-- Insert default page settings for Gallery page
INSERT INTO page_settings (page, key, value, description) VALUES
  ('gallery', 'page_heading', 'Gallery', 'Main page heading'),
  ('gallery', 'page_subheading', 'Explore our collection of memorable moments from events, programs, and activities', 'Page subheading'),
  ('gallery', 'all_media_button', 'All Media', 'All media filter button text'),
  ('gallery', 'images_only_button', 'Images Only', 'Images only filter button text'),
  ('gallery', 'videos_only_button', 'Videos Only', 'Videos only filter button text'),
  ('gallery', 'no_items_heading', 'No Gallery Items Yet', 'Heading when no gallery items'),
  ('gallery', 'no_items_message', 'Check back soon for photos and videos!', 'Message when no gallery items'),
  ('gallery', 'loading_message', 'Loading gallery...', 'Loading state message'),
  ('gallery', 'view_all_items', 'View All {count} Items', 'View all items button (use {count} for number)'),
  ('gallery', 'view_all_images', 'View All {count} Images', 'View all images button'),
  ('gallery', 'view_all_videos', 'View All {count} Videos', 'View all videos button'),
  ('gallery', 'label_items', 'items', 'Label for items count'),
  ('gallery', 'label_images', 'images', 'Label for images count'),
  ('gallery', 'label_videos', 'videos', 'Label for videos count');

-- Insert default page settings for Footer
INSERT INTO page_settings (page, key, value, description) VALUES
  ('footer', 'quick_links_heading', 'Quick Links', 'Quick links section heading'),
  ('footer', 'newsletter_heading', 'Newsletter', 'Newsletter section heading'),
  ('footer', 'email_placeholder', 'Your email', 'Email input placeholder'),
  ('footer', 'subscribe_button', 'Subscribe', 'Subscribe button text'),
  ('footer', 'already_subscribed_message', 'This email is already subscribed.', 'Error message for duplicate subscription'),
  ('footer', 'thank_you_message', 'Thank you for subscribing!', 'Success message after subscription'),
  ('footer', 'rights_text', 'All rights reserved.', 'Copyright rights text');

-- Insert default page settings for Header
INSERT INTO page_settings (page, key, value, description) VALUES
  ('header', 'admin_button', 'Admin', 'Admin button text');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_page_settings_timestamp
  BEFORE UPDATE ON page_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_page_settings_updated_at();