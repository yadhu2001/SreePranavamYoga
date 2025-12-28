import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          site_name: string;
          tagline: string;
          logo_url: string;
          primary_color: string;
          secondary_color: string;
          contact_email: string;
          contact_phone: string;
          social_facebook: string;
          social_twitter: string;
          social_instagram: string;
          social_youtube: string;
          footer_text: string;
          updated_at: string;
        };
      };
      programs: {
        Row: {
          id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string;
          full_content: string;
          image_url: string;
          duration: string;
          level: string;
          price: number;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          author: string;
          image_url: string;
          category: string;
          is_featured: boolean;
          is_published: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          location: string;
          event_date: string;
          end_date: string | null;
          image_url: string;
          registration_url: string;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
        };
      };
      solutions: {
        Row: {
          id: string;
          title: string;
          slug: string;
          icon: string;
          description: string;
          full_content: string;
          image_url: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          title: string;
          content: string;
          image_url: string;
          rating: number;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          name: string;
          bio: string;
          image_url: string;
          specialization: string;
          email: string;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
      };
      navigation_items: {
        Row: {
          id: string;
          label: string;
          url: string;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
      };
      hero_sections: {
        Row: {
          id: string;
          title: string;
          subtitle: string;
          background_image: string;
          background_video: string;
          cta_text: string;
          cta_url: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
      };
      program_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          sort_order: number;
          created_at: string;
        };
      };
    };
  };
};
