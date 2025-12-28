import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

interface CoursesProps {
  onNavigate?: (path: string) => void;
}

export default function Courses({ onNavigate }: CoursesProps) {
  const { currentLanguage, translateList } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [currentLanguage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description, image_url')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (coursesError) throw coursesError;
      const translated = await translateList(coursesData || [], ['title', 'description']);
      setCourses(translated);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Courses</h1>
          <p className="text-xl text-primary-50 max-w-3xl mx-auto">
            Discover transformative learning experiences designed to enhance your wellbeing and personal growth
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <BookOpen className="text-gray-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Available</h3>
              <p className="text-gray-600">Check back soon for upcoming courses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => onNavigate?.(`/courses/${course.id}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group cursor-pointer flex flex-col h-full"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-100 flex-shrink-0">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-primary-300" size={64} />
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition line-clamp-2 min-h-[3.5rem]">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">{course.description}</p>

                    {/* CTA */}
                    <button
                      className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold mt-auto"
                    >
                      Learn More
                    </button>
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
