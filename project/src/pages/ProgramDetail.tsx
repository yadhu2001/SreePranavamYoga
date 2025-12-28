import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import RegistrationFormModal from '../components/RegistrationFormModal';

interface Program {
  id: string;
  title: string;
  slug?: string;
  description: string;
  full_content: string; // ✅ ADDED
  level: string;
  duration: string;
  timings: string;
  image_url: string;
  form_id: string | null;
  teacher_name: string | null;
  teacher_qualifications: string | null;
}

interface ProgramDetailProps {
  programId: string;
  onNavigate: (path: string) => void;
}

export default function ProgramDetail({ programId, onNavigate }: ProgramDetailProps) {
  const { currentLanguage, translateContent } = useLanguage();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchProgramDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, currentLanguage]);

  const fetchProgramDetail = async () => {
    try {
      setLoading(true);

      // ✅ Try slug first
      let { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('slug', programId)
        .maybeSingle();

      // ✅ If not found by slug, try by ID
      if (!programData) {
        const { data: programById, error: idError } = await supabase
          .from('programs')
          .select('*')
          .eq('id', programId)
          .maybeSingle();

        programData = programById;
        programError = idError;
      }

      if (programError) throw programError;

      if (programData) {
        // ✅ translate full_content too
        const translated = await translateContent(programData, [
          'title',
          'description',
          'full_content', // ✅ IMPORTANT
          'level',
          'duration',
          'timings',
          'teacher_name',
          'teacher_qualifications',
        ]);

        setProgram(translated);
      } else {
        setProgram(null);
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading program...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Not Found</h2>
            <p className="text-gray-600 mb-6">The program you're looking for doesn't exist.</p>
            <button
              onClick={() => onNavigate('/programs')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Back to Programs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Use full_content inside, fallback to description
  const aboutHtml = program.full_content?.trim()
    ? program.full_content
    : program.description;

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="bg-white">
        <button
          onClick={() => onNavigate('/programs')}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
        >
          <ArrowLeft size={20} />
          Back to Programs
        </button>

        <div className="relative h-96 bg-gradient-to-br from-primary-100 to-primary-100">
          {program.image_url ? (
            <img
              src={program.image_url}
              alt={program.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="text-primary-300" size={120} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {program.level && (
                <span className="inline-block px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-semibold mb-4 capitalize">
                  {program.level}
                </span>
              )}
              <h1 className="text-5xl font-bold text-white mb-4">{program.title}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Program</h2>

                {/* ✅ SHOW full_content (fallback description) */}
                {aboutHtml && (
                  <div
                    className="prose prose-lg max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: aboutHtml }}
                  />
                )}
              </section>

              {/* Teacher Information */}
              {program.teacher_name && (
                <section className="bg-primary-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Instructor</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-white" size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{program.teacher_name}</h3>

                      {program.teacher_qualifications && (
                        <div className="text-gray-600">
                          <p className="font-semibold mb-2">Qualifications:</p>
                          <div
                            className="whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: program.teacher_qualifications }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sticky top-8 space-y-6">
                {program.duration && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-semibold text-gray-800">{program.duration}</p>
                    </div>
                  </div>
                )}

                {program.timings && (
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="text-primary-600" size={20} />
                      <h3 className="font-bold text-gray-800">Available Timings</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {program.timings}
                      </div>
                    </div>
                  </div>
                )}

                {program.form_id && (
                  <div className="border-t pt-6">
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      Register Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {showRegisterModal && program.form_id && (
        <RegistrationFormModal
          formId={program.form_id}
          onClose={() => setShowRegisterModal(false)}
          courseName={program.title}
        />
      )}
    </div>
  );
}
