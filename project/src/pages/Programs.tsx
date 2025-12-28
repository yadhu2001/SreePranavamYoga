import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import RegistrationFormModal from '../components/RegistrationFormModal';

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  level: string | null;
  duration: string;
  timings: string;
  form_id: string | null;
}

interface PageSettings {
  [key: string]: string;
}

interface ProgramsProps {
  onNavigate: (path: string) => void;
}

export default function Programs({ onNavigate }: ProgramsProps) {
  const { currentLanguage, translateList, translate } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<PageSettings>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    loadPrograms();
    loadSettings();
  }, [currentLanguage]);

  const loadPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (data) {
      const translated = await translateList(data, ['title', 'description', 'level', 'duration', 'timings']);
      setPrograms(translated);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('page_settings')
      .select('key, value')
      .eq('page', 'programs');
    if (data) {
      const settingsMap = data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as PageSettings);
      setSettings(settingsMap);
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{getSetting('page_heading', 'Our Programs')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getSetting('page_subheading', 'Discover transformative programs designed to enhance your wellbeing')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col h-full">
              {program.image_url && (
                <img src={program.image_url} alt={program.title} className="w-full h-56 object-cover flex-shrink-0" />
              )}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3 min-h-[28px]">
                  {program.level && (
                    <span className="text-xs font-semibold px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                      {program.level}
                    </span>
                  )}
                  {program.duration && (
                    <span className="text-xs text-gray-500">{program.duration}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-3 line-clamp-2 min-h-[4rem]">{program.title}</h3>
                {program.description && (
                  <div
                    className="text-gray-600 mb-4 line-clamp-3 flex-grow"
                    dangerouslySetInnerHTML={{ __html: program.description }}
                  />
                )}
                <div className="flex gap-2 mt-auto">
                  {program.form_id && (
                    <button
                      onClick={() => {
                        setSelectedProgram(program);
                        setShowRegisterModal(true);
                      }}
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
                    >
                      Register Now
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate(`/programs/${program.id}`)}
                    className={`${program.form_id ? 'flex-1' : 'w-full'} bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition inline-flex items-center justify-center font-semibold`}
                  >
                    {getSetting('learn_more_button', 'Learn More')} <ChevronRight size={18} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">{getSetting('no_programs_message', 'No programs found matching your criteria.')}</p>
          </div>
        )}
      </div>

      {showRegisterModal && selectedProgram?.form_id && (
        <RegistrationFormModal
          formId={selectedProgram.form_id}
          programId={selectedProgram.id}
          onClose={() => {
            setShowRegisterModal(false);
            setSelectedProgram(null);
          }}
        />
      )}
    </div>
  );
}
