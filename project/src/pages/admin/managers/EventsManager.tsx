import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface Event {
  id?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  event_date: string;
  end_date: string;
  image_url: string;
  registration_url: string;
  form_id: string | null;
  is_featured: boolean;
  is_published: boolean;
}

interface RegistrationForm {
  id: string;
  name: string;
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Event>({
    title: '',
    slug: '',
    description: '',
    location: '',
    event_date: '',
    end_date: '',
    image_url: '',
    registration_url: '',
    form_id: null,
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    loadEvents();
    loadForms();
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false });
    if (data) setEvents(data);
  };

  const loadForms = async () => {
    const { data } = await supabase.from('registration_forms').select('id, name').eq('is_active', true);
    if (data) setForms(data);
  };

  const handleSave = async () => {
    if (editingId) {
      await supabase.from('events').update(formData).eq('id', editingId);
    } else {
      await supabase.from('events').insert(formData);
    }
    loadEvents();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('events').delete().eq('id', id);
      loadEvents();
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      ...event,
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    });
    setEditingId(event.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      location: '',
      event_date: '',
      end_date: '',
      image_url: '',
      registration_url: '',
      form_id: null,
      is_featured: false,
      is_published: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Events</h2>
        <button onClick={() => setIsCreating(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus size={20} /> Add Event
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Event</h3>
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
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <input type="datetime-local" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date (optional)</label>
              <input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration Form</label>
              <select
                value={formData.form_id || ''}
                onChange={(e) => setFormData({ ...formData, form_id: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">None (Use External URL)</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration URL (External)</label>
              <input
                type="text"
                value={formData.registration_url}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Used if no form is selected"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Event Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter event description..."
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
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
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
            <div>
              <h3 className="font-bold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.location} • {new Date(event.event_date).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-1">
                {event.is_featured && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Featured</span>}
                {event.is_published && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Published</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(event.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
