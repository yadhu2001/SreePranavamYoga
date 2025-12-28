import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface NavItem {
  id?: string;
  label: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function NavigationManager() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<NavItem>({
    label: '',
    url: '',
    parent_id: null,
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadNavItems();
  }, []);

  const loadNavItems = async () => {
    const { data } = await supabase.from('navigation_items').select('*').order('sort_order');
    if (data) setNavItems(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('navigation_items').update(formData).eq('id', editingId);
    } else {
      await supabase.from('navigation_items').insert(formData);
    }
    loadNavItems();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('navigation_items').delete().eq('id', id);
      loadNavItems();
    }
  };

  const handleEdit = (item: NavItem) => {
    setFormData(item);
    setEditingId(item.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      label: '',
      url: '',
      parent_id: null,
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Navigation Menu</h2>
        <button onClick={() => setIsCreating(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} /> Add Menu Item
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Menu Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input type="text" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
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
        {navItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
            <div>
              <h3 className="font-bold">{item.label}</h3>
              <p className="text-sm text-gray-600">{item.url}</p>
              {item.is_active && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded mt-2 inline-block">Active</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(item.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
