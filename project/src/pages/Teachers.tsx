import { useState, useEffect } from 'react';
import { Mail, Award, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { loadPageSettings, PageSettings, createGetSetting } from '../utils/pageSettings';

interface Teacher {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string;
  specialties: string;
  email: string;
  display_order: number;
}

export default function Teachers() {
  const { currentLanguage, translateList } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PageSettings>({});

  useEffect(() => {
    fetchTeachers();
    loadSettings();
  }, [currentLanguage]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const translated = await translateList(data || [], ['name', 'title', 'bio', 'specialties']);
      setTeachers(translated);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const data = await loadPageSettings('teachers');
    setSettings(data);
  };

  const getSetting = createGetSetting(settings);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{getSetting('loading_message', 'Loading teachers...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">{getSetting('page_heading', 'Our Teachers')}</h1>
          <p className="text-xl text-primary-50 max-w-3xl mx-auto">
            {getSetting('page_subheading', 'Meet our experienced and dedicated instructors who are passionate about guiding you on your wellness journey')}
          </p>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {teachers.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <BookOpen className="text-gray-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{getSetting('no_teachers_heading', 'No Teachers Available')}</h3>
              <p className="text-gray-600">{getSetting('no_teachers_message', 'Check back soon to meet our instructors!')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
                >
                  {/* Teacher Image */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-100">
                    {teacher.image_url ? (
                      <img
                        src={teacher.image_url}
                        alt={teacher.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-primary-300" size={80} />
                      </div>
                    )}
                  </div>

                  {/* Teacher Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition">
                      {teacher.name}
                    </h3>
                    <p className="text-primary-600 font-semibold mb-4">{teacher.title}</p>

                    <div
                      className="text-gray-600 mb-4 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: teacher.bio }}
                    />

                    {/* Specialties */}
                    {teacher.specialties && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award size={16} className="text-primary-600" />
                          <span className="text-sm font-semibold text-gray-700">{getSetting('specialties_label', 'Specialties')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacher.specialties.split(',').map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                            >
                              {specialty.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {teacher.email && (
                      <div className="pt-4 border-t">
                        <a
                          href={`mailto:${teacher.email}`}
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition"
                        >
                          <Mail size={16} />
                          <span className="text-sm font-medium">{getSetting('contact_teacher_button', 'Contact Teacher')}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
