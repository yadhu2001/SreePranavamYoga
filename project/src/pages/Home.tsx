import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import HeroSection from '../components/HeroSection';

interface Program {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: string;
  duration: string;
}

interface Testimonial {
  id: string;
  name: string;
  title: string;
  content: string;
  image_url: string;
  rating: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FeatureSection {
  id: string;
  title: string;
  message: string;
  image_url: string;
  button_text: string;
  button_url: string;
}

interface PageSettings {
  [key: string]: string;
}

interface HomeProps {
  onNavigate: (path: string) => void;
}

function getInitial(name: string) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  if (imageUrl && imageUrl.trim()) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-16 h-16 rounded-full object-cover mr-4 border border-gray-200"
      />
    );
  }

  return (
    <div className="w-16 h-16 rounded-full mr-4 bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
      {getInitial(name)}
    </div>
  );
}

export default function Home({ onNavigate }: HomeProps) {
  const { currentLanguage, translateList } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [featureSections, setFeatureSections] = useState<FeatureSection[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [settings, setSettings] = useState<PageSettings>({});

  // ✅ Testimonials slider state
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const loadData = async () => {
    const [programsData, testimonialsData, faqsData, featuresData, settingsData] = await Promise.all([
      supabase.from('programs').select('*').eq('is_published', true).eq('is_featured', true).limit(3),
      // ✅ Load ALL featured+published testimonials (no limit now)
      supabase.from('testimonials').select('*').eq('is_published', true).eq('is_featured', true).order('sort_order'),
      supabase.from('faqs').select('*').eq('is_published', true).order('sort_order').limit(5),
      supabase.from('feature_sections').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('page_settings').select('key, value').eq('page', 'home'),
    ]);

    if (programsData.data) {
      const translated = await translateList(programsData.data, ['title', 'description', 'level', 'duration']);
      setPrograms(translated);
    }
    if (testimonialsData.data) {
      const translated = await translateList(testimonialsData.data, ['name', 'title', 'content']);
      setTestimonials(translated);
      setTestimonialIndex(0); // reset when language changes
    }
    if (faqsData.data) {
      const translated = await translateList(faqsData.data, ['question', 'answer']);
      setFaqs(translated);
    }
    if (featuresData.data) {
      const translated = await translateList(featuresData.data, ['title', 'message', 'button_text']);
      setFeatureSections(translated);
    }
    if (settingsData.data) {
      const settingsMap = settingsData.data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as PageSettings);
      setSettings(settingsMap);
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  // ✅ Auto-rotate testimonials only if more than 3
  useEffect(() => {
    if (testimonials.length <= 3) return;

    const interval = setInterval(() => {
      setTestimonialIndex((prev) => {
        const maxStart = Math.max(0, testimonials.length - 3);
        return prev >= maxStart ? 0 : prev + 1;
      });
    }, 3500); // 3.5 seconds

    return () => clearInterval(interval);
  }, [testimonials]);

  // ✅ Visible testimonials (3 at a time on desktop)
  const visibleTestimonials = useMemo(() => {
    if (testimonials.length <= 3) return testimonials;
    return testimonials.slice(testimonialIndex, testimonialIndex + 3);
  }, [testimonials, testimonialIndex]);

  return (
    <div className="min-h-screen">
      <HeroSection onNavigate={onNavigate} />

      {/* PROGRAMS (unchanged) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            {getSetting('featured_programs_heading', 'Featured Programs')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {getSetting('featured_programs_subheading', 'Transform your life with our expertly designed programs')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                <img src={program.image_url} alt={program.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                      {program.level}
                    </span>
                    <span className="text-xs text-gray-500">{program.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                  <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: program.description }} />
                  <button
                    onClick={() => onNavigate(`/programs/${program.id}`)}
                    className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center"
                  >
                    {getSetting('learn_more_button', 'Learn More')} <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('/programs')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              {getSetting('view_all_programs_button', 'View All Programs')}
            </button>
          </div>
        </div>
      </section>

      {/* ✅ TESTIMONIALS AUTO SLIDER (quotes removed) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            {getSetting('testimonials_heading', 'What Our Students Say')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {getSetting('testimonials_subheading', 'Real transformations from real people')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all">
            {(testimonials.length > 3 ? visibleTestimonials : testimonials).map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <Avatar name={testimonial.name} imageUrl={testimonial.image_url} />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>

                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* ✅ NO default quotes */}
                <div
                  className="text-gray-700 italic"
                  dangerouslySetInnerHTML={{ __html: testimonial.content }}
                />
              </div>
            ))}
          </div>

          {testimonials.length > 3 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === testimonialIndex ? 'bg-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonials set ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES (unchanged) */}
      {featureSections.map((feature, idx) => (
        <section key={feature.id} className="py-16 bg-gradient-to-r from-primary-50 to-primary-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 flex justify-center">
                <img
                  src={feature.image_url}
                  alt={feature.title}
                  className="h-64 md:h-72 w-auto object-contain rounded-xl shadow-lg"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>

              <div className="md:w-1/2">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{feature.title}</h2>
                <div
                  className="text-lg text-gray-700 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: feature.message }}
                />

                {feature.button_text && feature.button_url && (
                  <button
                    onClick={() => onNavigate(feature.button_url)}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition text-lg font-semibold inline-flex items-center gap-2"
                  >
                    {feature.button_text}
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* FAQ (unchanged) */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-4">
            {getSetting('faqs_heading', 'Frequently Asked Questions')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {getSetting('faqs_subheading', 'Get answers to common questions')}
          </p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center hover:bg-gray-50 transition"
                >
                  {faq.question}
                  <ChevronRight className={`transform transition ${openFaq === faq.id ? 'rotate-90' : ''}`} />
                </button>

                {openFaq === faq.id && (
                  <div
                    className="px-6 py-4 bg-gray-50 border-t text-gray-700"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
