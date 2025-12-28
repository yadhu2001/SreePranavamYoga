import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from '../../../components/ImageUpload';
import RichTextEditor from '../../../components/RichTextEditor';

interface Teacher {
  id?: string;
  name: string;
  bio: string;
  image_url: string;
  specialization: string;
  email: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
}

export default function TeachersManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Teacher>({
    name: '',
    bio: '',
    image_url: '',
    specialization: '',
    email: '',
    is_featured: false,
    is_published: false,
    sort_order: 0,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading teachers:', error);
      return;
    }

    setTeachers((data || []) as Teacher[]);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    if (editingId) {
      const { error } = await supabase.from('teachers').update(formData).eq('id', editingId);
      if (error) console.error('Error updating teacher:', error);
    } else {
      const { error } = await supabase.from('teachers').insert(formData);
      if (error) console.error('Error creating teacher:', error);
    }

    await loadTeachers();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) console.error('Error deleting teacher:', error);

    await loadTeachers();
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      id: teacher.id,
      name: teacher.name || '',
      bio: teacher.bio || '',
      image_url: teacher.image_url || '',
      specialization: teacher.specialization || '',
      email: teacher.email || '',
      is_featured: !!teacher.is_featured,
      is_published: !!teacher.is_published,
      sort_order: typeof teacher.sort_order === 'number' ? teacher.sort_order : 0,
    });

    setEditingId(teacher.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bio: '',
      image_url: '',
      specialization: '',
      email: '',
      is_featured: false,
      is_published: false,
      sort_order: 0,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Teachers</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Teacher
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Teacher</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium mb-1">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Acharya, Yoga Instructor"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <ImageUpload
                label="Teacher Photo"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <RichTextEditor
                value={formData.bio}
                onChange={(value) => setFormData({ ...formData, bio: value })}
                placeholder="Enter teacher bio..."
              />
            </div>

            {/* Flags */}
            <div className="flex gap-4 md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="text-sm font-medium">Featured</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Save size={18} /> Save
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
            <div>
              <h3 className="font-bold">{teacher.name}</h3>
              <p className="text-sm text-gray-600">{teacher.specialization}</p>

              <div className="flex gap-2 mt-2 flex-wrap">
                {teacher.is_featured && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Featured</span>
                )}
                {teacher.is_published && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Published</span>
                )}
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  Sort: {teacher.sort_order ?? 0}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(teacher.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
