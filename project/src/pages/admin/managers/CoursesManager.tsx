import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from '../../../components/ImageUpload';

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

  // ✅ NEW (optional)
  form_id: string | null;

  is_published: boolean;
  display_order: number;
}

interface RegistrationForm {
  id: string;
  name: string;
}

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [forms, setForms] = useState<RegistrationForm[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchForms();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCourses((data || []) as Course[]);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_forms')
        .select('id, name')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms((data || []) as RegistrationForm[]);
    } catch (error) {
      console.error('Error fetching registration forms:', error);
      setForms([]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // ✅ Only send fields that exist in the table
      const courseData: Partial<Course> = { ...editingCourse };

      if (editingCourse.id) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert([
          {
            ...courseData,
            display_order: courses.length,
          },
        ]);

        if (error) throw error;
      }

      await fetchCourses();
      setIsEditing(false);
      setEditingCourse({});
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;

      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published })
        .eq('id', course.id);

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Courses Manager</h2>
        <button
          onClick={() => {
            setEditingCourse({
              is_published: true,
              form_id: null, // ✅ default optional
            });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={20} />
          New Course
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No courses yet. Create your first course!
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.image_url && (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">{course.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 space-y-1">
                        {course.level && (
                          <div>
                            Level: <span className="capitalize">{course.level}</span>
                          </div>
                        )}
                        {course.course_duration && <div>Duration: {course.course_duration}</div>}
                        {course.form_id && (
                          <div className="text-xs text-primary-700 font-semibold">
                            Registration: Enabled
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(course)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          course.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {course.is_published ? (
                          <>
                            <Eye size={14} /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setIsEditing(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-blue-600" />
                        </button>

                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingCourse.id ? 'Edit Course' : 'New Course'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCourse({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Advanced Yoga Certification"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Course description"
                  required
                />
              </div>

              <ImageUpload
                label="Course Image"
                value={editingCourse.image_url || ''}
                onChange={(url) => setEditingCourse({ ...editingCourse, image_url: url })}
                bucketName="site-assets"
                folder="courses"
              />

              {/* ✅ NEW: Registration Form Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Form (optional)
                </label>
                <select
                  value={editingCourse.form_id || ''}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      form_id: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No Registration</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Forms are created in Registration Forms Admin. Select one to enable “Register Now”.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Duration</label>
                  <input
                    type="text"
                    value={editingCourse.course_duration || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, course_duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={editingCourse.level || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Limit</label>
                  <input
                    type="text"
                    value={editingCourse.age_limit || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, age_limit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 18+, 16-60 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fees</label>
                  <input
                    type="text"
                    value={editingCourse.fees || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, fees: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., ₹5000 per month"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
                <textarea
                  value={editingCourse.eligibility_criteria || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, eligibility_criteria: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter eligibility requirements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certification Scope</label>
                <textarea
                  value={editingCourse.certification_scope || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, certification_scope: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter certification details and outcomes"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish"
                  checked={editingCourse.is_published ?? true}
                  onChange={(e) => setEditingCourse({ ...editingCourse, is_published: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="publish" className="text-sm text-gray-700">
                  Publish this course
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCourse({});
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingCourse.title || !editingCourse.description}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
