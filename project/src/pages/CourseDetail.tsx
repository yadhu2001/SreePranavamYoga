import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import RegistrationFormModal from '../components/RegistrationFormModal';

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;

  eligibility_criteria: string | null;
  age_limit: string | null;
  course_duration: string | null;
  level: string | null;
  fees: string | null;
  certification_scope: string | null;

  // ✅ optional registration
  form_id: string | null;

  // optional if you also route by slug
  slug?: string | null;
}

interface CourseDetailProps {
  courseId: string; // slug or id
  onNavigate: (path: string) => void;
}

export default function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const { currentLanguage, translateContent } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, currentLanguage]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);

      // 1) Try slug
      let { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', courseId)
        .eq('is_published', true)
        .maybeSingle();

      // 2) Fallback: try id
      if (!data) {
        const byId = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .eq('is_published', true)
          .maybeSingle();

        data = byId.data as any;
        error = byId.error as any;
      }

      if (error) throw error;

      if (data) {
        const translated = await translateContent(data, [
          'title',
          'description',
          'eligibility_criteria',
          'age_limit',
          'course_duration',
          'level',
          'fees',
          'certification_scope',
        ]);

        setCourse(translated as Course);
      } else {
        setCourse(null);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
            <button
              onClick={() => onNavigate('/courses')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasDetails =
    course.course_duration ||
    course.level ||
    course.eligibility_criteria ||
    course.age_limit ||
    course.fees ||
    course.certification_scope ||
    course.form_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="bg-white">
        <button
          onClick={() => onNavigate('/courses')}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>

        <div className="relative h-96 bg-gradient-to-br from-primary-100 to-primary-100">
          {course.image_url ? (
            <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="text-primary-300" size={120} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-5xl font-bold text-white mb-4">{course.title}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Description</h2>
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.description || '' }}
              />
            </section>

            {hasDetails && (
              <section className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Details</h2>

                <div className="space-y-6">
                  {course.course_duration && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Course Duration</h3>
                      <p className="text-gray-600">{course.course_duration}</p>
                    </div>
                  )}

                  {course.level && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Level</h3>
                      <p className="text-gray-600 capitalize">{course.level}</p>
                    </div>
                  )}

                  {course.eligibility_criteria && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Eligibility Criteria</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{course.eligibility_criteria}</p>
                    </div>
                  )}

                  {course.age_limit && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Age Limit</h3>
                      <p className="text-gray-600">{course.age_limit}</p>
                    </div>
                  )}

                  {course.fees && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Fees</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{course.fees}</p>
                    </div>
                  )}

                  {course.certification_scope && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Certification Scope</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{course.certification_scope}</p>
                    </div>
                  )}

                  {/* ✅ Register button */}
                  {course.form_id && (
                    <div className="pt-6 border-t">
                      <button
                        onClick={() => setShowRegisterModal(true)}
                        className="w-full bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition font-bold text-lg shadow-lg hover:shadow-xl"
                      >
                        Register Now
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>

      {showRegisterModal && course.form_id && (
        <RegistrationFormModal
          formId={course.form_id}
          courseId={course.id}
          courseName={course.title}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}
