import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutSection {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  display_order: number;
}

interface AboutSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  vision: string;
  mission: string;
  core_values: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  map_embed_url: string;
  display_order: number;
}

export default function AboutUs() {
  const { currentLanguage, translateList, translateContent } = useLanguage();

  const [sections, setSections] = useState<AboutSection[]>([]);
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const fetchAboutData = async () => {
    try {
      setLoading(true);

      const [sectionsRes, settingsRes, locationsRes] = await Promise.all([
        supabase
          .from('about_us_sections')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true }),

        supabase
          .from('about_us_settings')
          .select('*')
          .limit(1)
          .maybeSingle(),

        supabase
          .from('locations')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true }),
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      // locations optional
      if (locationsRes.error) console.warn('Locations fetch skipped:', locationsRes.error);

      // ✅ Translate title only (NOT content HTML)
      const translatedSections = await translateList(sectionsRes.data || [], ['title']);
      const finalSections = (translatedSections || []).map((s: any, idx: number) => ({
        ...s,
        content: (sectionsRes.data || [])[idx]?.content || s.content, // keep HTML exactly
      }));
      setSections(finalSections);

      if (settingsRes.data) {
        // ✅ Translate hero fields only (NOT rich HTML fields)
        const translatedHero: any = await translateContent(settingsRes.data, [
          'hero_title',
          'hero_subtitle',
        ]);

        // Keep all rich text EXACTLY as saved from manager
        const fixedSettings: AboutSettings = {
          hero_title: translatedHero.hero_title ?? settingsRes.data.hero_title ?? 'About Us',
          hero_subtitle: translatedHero.hero_subtitle ?? settingsRes.data.hero_subtitle ?? '',
          hero_image_url: settingsRes.data.hero_image_url ?? null,
          vision: settingsRes.data.vision ?? '',
          mission: settingsRes.data.mission ?? '',
          core_values: settingsRes.data.core_values ?? '',
        };

        setSettings(fixedSettings);
      } else {
        setSettings(null);
      }

      const locData = locationsRes.data || [];
      const translatedLocations = await translateList(locData, ['name', 'address', 'city', 'state']);
      setLocations(translatedLocations || []);
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasSettingsContent =
    !!settings?.vision?.trim() || !!settings?.mission?.trim() || !!settings?.core_values?.trim();

  const showEmptyState = sections.length === 0 && !hasSettingsContent && locations.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20"
        style={
          settings?.hero_image_url
            ? {
                backgroundImage: `linear-gradient(rgba(5, 150, 105, 0.9), rgba(15, 118, 110, 0.9)), url(${settings.hero_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">{settings?.hero_title || 'About Us'}</h1>
          <p className="text-xl text-primary-50 max-w-3xl mx-auto">
            {settings?.hero_subtitle || 'Learn more about our wellness center'}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showEmptyState ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h3>
              <p className="text-gray-600">We're working on this page. Check back soon!</p>
            </div>
          ) : sections.length > 0 ? (
            <div className="space-y-16">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } gap-12 items-center`}
                >
                  {section.image_url && (
                    <div className="w-full lg:w-1/2">
                      <img
                        src={section.image_url}
                        alt={section.title}
                        className="w-full h-96 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                  )}

                  <div className={`w-full ${section.image_url ? 'lg:w-1/2' : ''}`}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">{section.title}</h2>

                    {/* ✅ EXACT HTML RENDER (bullets/numbers/fonts/colors/align like manager) */}
                    <div
                      className="ql-editor text-gray-700"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No About sections added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Vision Section */}
      {settings?.vision?.trim() && (
        <section className="py-16 bg-gradient-to-br from-primary-50 to-primary-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Vision</h2>
            </div>

            <div className="ql-editor text-gray-700" dangerouslySetInnerHTML={{ __html: settings.vision }} />
          </div>
        </section>
      )}

      {/* Mission Section */}
      {settings?.mission?.trim() && (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Mission</h2>
            </div>

            <div className="ql-editor text-gray-700" dangerouslySetInnerHTML={{ __html: settings.mission }} />
          </div>
        </section>
      )}

      {/* Core Values Section */}
      {settings?.core_values?.trim() && (
        <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex w-20 h-20 bg-amber-600 rounded-full items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Activities</h2>
            </div>

            <div className="ql-editor text-gray-700" dangerouslySetInnerHTML={{ __html: settings.core_values }} />
          </div>
        </section>
      )}

      {/* Locations Section */}
      {locations.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Locations</h2>
              <p className="text-xl text-gray-600">Visit us at any of our wellness centers</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition"
                >
                  {location.map_embed_url && (
                    <div className="w-full h-64">
                      <iframe
                        src={location.map_embed_url}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{location.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p>{location.address}</p>
                          {(location.city || location.state) && (
                            <p>
                              {location.city}
                              {location.city && location.state && ', '}
                              {location.state}
                            </p>
                          )}
                        </div>
                      </div>

                      {location.phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          <a href={`tel:${location.phone}`} className="hover:text-primary-600 transition">
                            {location.phone}
                          </a>
                        </div>
                      )}

                      {location.email && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          <a href={`mailto:${location.email}`} className="hover:text-primary-600 transition">
                            {location.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
