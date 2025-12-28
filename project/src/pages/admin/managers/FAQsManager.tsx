import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

export default function FAQsManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FAQ>({
    question: '',
    answer: '',
    category: 'general',
    sort_order: 0,
    is_published: false,
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    if (data) setFaqs(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('faqs').update(formData).eq('id', editingId);
    } else {
      await supabase.from('faqs').insert(formData);
    }
    loadFAQs();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('faqs').delete().eq('id', id);
      loadFAQs();
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData(faq);
    setEditingId(faq.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      sort_order: 0,
      is_published: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">FAQs</h2>
        <button onClick={() => setIsCreating(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} /> Add FAQ
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} FAQ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <input type="text" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Answer</label>
              <RichTextEditor
                value={formData.answer}
                onChange={(value) => setFormData({ ...formData, answer: value })}
                placeholder="Enter FAQ answer..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} />
              <span className="text-sm font-medium">Published</span>
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
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
            <div>
              <h3 className="font-bold">{faq.question}</h3>
              <p className="text-sm text-gray-600 mt-1">{faq.category}</p>
              {faq.is_published && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded mt-2 inline-block">Published</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(faq.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
