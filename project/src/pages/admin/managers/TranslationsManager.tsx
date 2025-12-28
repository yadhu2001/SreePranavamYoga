import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Trash2, Edit, Plus, Save, X, Languages } from 'lucide-react';

interface Translation {
  id: string;
  language_code: string;
  translation_key: string;
  translation_value: string;
  category: string;
}

interface Language {
  language_code: string;
  native_name: string;
}

export default function TranslationsManager() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    translation_key: '',
    translation_value: '',
    category: 'general',
  });

  useEffect(() => {
    fetchLanguages();
    fetchTranslations();
  }, [selectedLanguage, selectedCategory]);

  const fetchLanguages = async () => {
    const { data } = await supabase
      .from('language_settings')
      .select('language_code, native_name')
      .eq('is_active', true)
      .order('display_order');

    if (data) setLanguages(data);
  };

  const fetchTranslations = async () => {
    let query = supabase
      .from('translations')
      .select('*')
      .eq('language_code', selectedLanguage)
      .order('category')
      .order('translation_key');

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data } = await query;

    if (data) {
      setTranslations(data);
      const uniqueCategories = Array.from(new Set(data.map(t => t.category)));
      setCategories(uniqueCategories);
    }
  };

  const handleSave = async () => {
    if (!formData.translation_key || !formData.translation_value) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('translations')
        .update({
          translation_value: formData.translation_value,
          category: formData.category,
        })
        .eq('id', editingId);

      if (error) {
        alert('Error updating translation: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('translations')
        .insert({
          language_code: selectedLanguage,
          translation_key: formData.translation_key,
          translation_value: formData.translation_value,
          category: formData.category,
        });

      if (error) {
        alert('Error adding translation: ' + error.message);
        return;
      }
    }

    setEditingId(null);
    setIsAdding(false);
    setFormData({ translation_key: '', translation_value: '', category: 'general' });
    fetchTranslations();
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setFormData({
      translation_key: translation.translation_key,
      translation_value: translation.translation_value,
      category: translation.category,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;

    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting translation: ' + error.message);
      return;
    }

    fetchTranslations();
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ translation_key: '', translation_value: '', category: 'general' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Languages className="text-primary-600" size={32} />
          <h2 className="text-3xl font-bold text-gray-800">Translations</h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={20} />
          Add Translation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.language_code} value={lang.language_code}>
                {lang.native_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg border-2 border-primary-200 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            {editingId ? 'Edit Translation' : 'Add Translation'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Translation Key *
              </label>
              <input
                type="text"
                value={formData.translation_key}
                onChange={(e) => setFormData({ ...formData, translation_key: e.target.value })}
                disabled={!!editingId}
                placeholder="e.g., nav.home"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., navigation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Translation Value *
            </label>
            <textarea
              value={formData.translation_value}
              onChange={(e) => setFormData({ ...formData, translation_value: e.target.value })}
              rows={3}
              placeholder="Enter translated text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <Save size={20} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No translations found. Add your first translation!
                  </td>
                </tr>
              ) : (
                translations.map((translation) => (
                  <tr key={translation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {translation.translation_key}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {translation.translation_value}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                        {translation.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(translation)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(translation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
