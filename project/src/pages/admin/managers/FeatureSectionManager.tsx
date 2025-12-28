import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface FeatureSection {
  id?: string;
  title: string;
  message: string;
  image_url: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function FeatureSectionManager() {
  const [sections, setSections] = useState<FeatureSection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FeatureSection>({
    title: '',
    message: '',
    image_url: '',
    button_text: '',
    button_url: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const { data } = await supabase
      .from('feature_sections')
      .select('*')
      .order('sort_order');
    if (data) setSections(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('feature_sections').update(formData).eq('id', editingId);
    } else {
      const maxOrder = Math.max(0, ...sections.map(s => s.sort_order || 0));
      await supabase.from('feature_sections').insert({ ...formData, sort_order: maxOrder + 1 });
    }
    loadSections();
    resetForm();
  };

  const handleToggleActive = async (section: FeatureSection) => {
    await supabase
      .from('feature_sections')
      .update({ is_active: !section.is_active })
      .eq('id', section.id);
    loadSections();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const current = sections[currentIndex];
    const target = sections[targetIndex];

    await Promise.all([
      supabase.from('feature_sections').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('feature_sections').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);

    loadSections();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('feature_sections').delete().eq('id', id);
      loadSections();
    }
  };

  const handleEdit = (section: FeatureSection) => {
    setFormData(section);
    setEditingId(section.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      image_url: '',
      button_text: '',
      button_url: '',
      is_active: true,
      sort_order: 0,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Feature Sections</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Feature Section
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editingId ? 'Edit' : 'Create'} Feature Section
          </h3>
          <div className="space-y-4">
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
              <label className="block text-sm font-medium mb-2">Message</label>
              <RichTextEditor
                value={formData.message}
                onChange={(value) => setFormData({ ...formData, message: value })}
                placeholder="Enter your message..."
              />
            </div>
            <div>
              <ImageUpload
                label="Feature Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Button Text (optional)</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Button URL</label>
                <input
                  type="text"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="/programs"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span className="text-sm font-medium">Active (visible on site)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSave}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Save size={18} /> Save
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
              section.is_active ? 'border-primary-500' : 'border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  {section.is_active ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                {section.image_url && (
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="h-24 w-40 object-cover rounded mt-2"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleReorder(section.id!, 'up')}
                    disabled={index === 0}
                    className={`p-2 rounded ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => handleReorder(section.id!, 'down')}
                    disabled={index === sections.length - 1}
                    className={`p-2 rounded ${
                      index === sections.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleActive(section)}
                    className={`p-2 rounded ${
                      section.is_active
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {section.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && !isCreating && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No feature sections yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
