import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface Solution {
  id?: string;
  title: string;
  slug: string;
  icon: string;
  description: string;
  full_content: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export default function SolutionsManager() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Solution>({
    title: '',
    slug: '',
    icon: 'Heart',
    description: '',
    full_content: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    const { data } = await supabase.from('solutions').select('*').order('sort_order');
    if (data) setSolutions(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('solutions').update(formData).eq('id', editingId);
    } else {
      await supabase.from('solutions').insert(formData);
    }
    loadSolutions();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('solutions').delete().eq('id', id);
      loadSolutions();
    }
  };

  const handleEdit = (solution: Solution) => {
    setFormData(solution);
    setEditingId(solution.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      icon: 'Heart',
      description: '',
      full_content: '',
      image_url: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Solutions</h2>
        <button onClick={() => setIsCreating(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} /> Add Solution
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Solution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon (Lucide icon name)</label>
              <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g., Heart, Brain, Shield" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Solution Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter solution description..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Full Content</label>
              <RichTextEditor
                value={formData.full_content}
                onChange={(value) => setFormData({ ...formData, full_content: value })}
                placeholder="Enter detailed solution content..."
              />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
              <Save size={18} /> Save
            </button>
            <button onClick={resetForm} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2">
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {solutions.map((solution) => (
          <div key={solution.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
            <div>
              <h3 className="font-bold">{solution.title}</h3>
              <p className="text-sm text-gray-600">Icon: {solution.icon} • Order: {solution.sort_order}</p>
              {solution.is_active && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded mt-1 inline-block">Active</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(solution)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(solution.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
