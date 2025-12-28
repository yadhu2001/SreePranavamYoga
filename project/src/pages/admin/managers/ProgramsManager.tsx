import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface Program {
  id?: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  full_content: string;
  image_url: string;
  duration: string;
  timings: string;
  level: string | null;
  form_id: string | null;
  teacher_name: string;
  teacher_qualifications: string;
  is_featured: boolean;
  is_published: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Form {
  id: string;
  name: string;
}

export default function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Program>({
    category_id: null,
    title: '',
    slug: '',
    description: '',
    full_content: '',
    image_url: '',
    duration: '',
    timings: '',
    level: null,
    form_id: null,
    teacher_name: '',
    teacher_qualifications: '',
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    loadPrograms();
    loadCategories();
    loadForms();
  }, []);

  const loadPrograms = async () => {
    const { data } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
    if (data) setPrograms(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('program_categories').select('id, name');
    if (data) setCategories(data);
  };

  const loadForms = async () => {
    const { data } = await supabase.from('registration_forms').select('id, name').eq('is_active', true);
    if (data) setForms(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('programs').update(formData).eq('id', editingId);
    } else {
      await supabase.from('programs').insert(formData);
    }
    loadPrograms();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      await supabase.from('programs').delete().eq('id', id);
      loadPrograms();
    }
  };

  const handleEdit = (program: Program) => {
    setFormData(program);
    setEditingId(program.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      category_id: null,
      title: '',
      slug: '',
      description: '',
      full_content: '',
      image_url: '',
      duration: '',
      timings: '',
      level: null,
      form_id: null,
      teacher_name: '',
      teacher_qualifications: '',
      is_featured: false,
      is_published: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Programs</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Add Program
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Program' : 'Create New Program'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category (optional)</label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level (optional)</label>
              <select
                value={formData.level || ''}
                onChange={(e) => setFormData({ ...formData, level: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (optional)</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 4 weeks, 6 months"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Timings (optional)</label>
              <textarea
                value={formData.timings}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                placeholder="5.30am to 6.30am offline&#10;6.30am to 7.30am offline and online&#10;9.30am to 10.30 am offline Ladies batch&#10;4pm to 5pm offline&#10;5.15pm to 6.15pm Ladies batch&#10;6.45pm to 7.45 pm"
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter each timing on a new line</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teacher Name (optional)</label>
              <input
                type="text"
                value={formData.teacher_name}
                onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                placeholder="e.g., Sreedevi"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teacher Qualifications (optional)</label>
              <textarea
                value={formData.teacher_qualifications}
                onChange={(e) => setFormData({ ...formData, teacher_qualifications: e.target.value })}
                placeholder="e.g., Certified Yoga Instructor&#10;10 years of experience&#10;RYT-500 Certified"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Registration Form (optional)</label>
              <select
                value={formData.form_id || ''}
                onChange={(e) => setFormData({ ...formData, form_id: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">No Form</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Program Image (optional)"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter program description..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Full Content (optional)</label>
              <RichTextEditor
                value={formData.full_content}
                onChange={(value) => setFormData({ ...formData, full_content: value })}
                placeholder="Enter detailed program content..."
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Save size={18} /> Save
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {programs.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {program.image_url && (
                <img src={program.image_url} alt={program.title} className="w-16 h-16 object-cover rounded" />
              )}
              <div>
                <h3 className="font-bold">{program.title}</h3>
                <p className="text-sm text-gray-600">
                  {program.level && <span>{program.level}</span>}
                  {program.level && program.duration && <span> • </span>}
                  {program.duration && <span>{program.duration}</span>}
                </p>
                <div className="flex gap-2 mt-1">
                  {program.is_featured && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Featured</span>
                  )}
                  {program.is_published && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Published</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(program)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(program.id!)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
