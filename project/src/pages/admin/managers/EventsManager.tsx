// src/pages/admin/events/EventsManager.tsx
import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface Event {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  location?: string;
  event_date?: string | null;
  end_date?: string | null;
  image_url?: string;
  registration_url?: string;
  form_id?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
}

interface RegistrationForm {
  id: string;
  name: string;
}

const toLocalIsoOrNull = (v?: string | null) => {
  if (!v) return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.length === 16 ? `${trimmed}:00` : trimmed;
};

const toDatetimeLocalValue = (dbValue?: string | null) => {
  if (!dbValue) return '';
  const d = new Date(dbValue);
  if (Number.isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const slugify = (s: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function safeDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
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
    event_date: null,
    end_date: null,
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
    const { data, error } = await supabase.from('events').select('*');

    if (error) {
      console.error('Load events error:', error);
      return;
    }

    const list = (data as Event[]) || [];
    const now = new Date();

    const featured: Event[] = [];
    const upcoming: Event[] = [];
    const nodate: Event[] = [];
    const past: Event[] = [];

    list.forEach((ev) => {
      if (ev.is_featured) {
        featured.push(ev);
        return;
      }

      const base = ev.end_date ?? ev.event_date ?? null;
      const d = safeDate(base);

      if (!base || !d) {
        nodate.push(ev);
        return;
      }

      if (d >= now) upcoming.push(ev);
      else past.push(ev);
    });

    const dateSorterAsc = (a: Event, b: Event) => {
      const da = safeDate(a.end_date ?? a.event_date ?? null)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = safeDate(b.end_date ?? b.event_date ?? null)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    };

    featured.sort(dateSorterAsc);
    upcoming.sort(dateSorterAsc);
    nodate.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    past.sort(dateSorterAsc);

    setEvents([...featured, ...upcoming, ...nodate, ...past]);
  };

  const loadForms = async () => {
    const { data, error } = await supabase.from('registration_forms').select('id, name').eq('is_active', true);

    if (error) {
      console.error('Load forms error:', error);
      return;
    }

    setForms((data as RegistrationForm[]) || []);
  };

  const autoSlug = useMemo(() => slugify(formData.title || ''), [formData.title]);

  const buildPayload = (e: Event) => {
    const title = (e.title || '').trim();
    const slug = (e.slug || '').trim() || slugify(title);

    return {
      title: title || null,
      slug: slug || null,
      description: e.description || null,
      location: (e.location || '').trim() || null,
      event_date: toLocalIsoOrNull(e.event_date), // ✅ allow null
      end_date: toLocalIsoOrNull(e.end_date),
      image_url: e.image_url || null,
      registration_url: (e.registration_url || '').trim() || null,
      form_id: e.form_id ?? null,
      is_featured: e.is_featured ?? false,
      is_published: e.is_published ?? false,
    };
  };

  const handleSave = async () => {
    const title = (formData.title || '').trim();
    if (!title) return alert('Title is required');

    // ✅ Allow publish even without event_date
    const payload = buildPayload(formData);

    const res = editingId
      ? await supabase.from('events').update(payload).eq('id', editingId).select()
      : await supabase.from('events').insert(payload).select();

    if (res.error) {
      console.error('Supabase save error:', res.error);
      alert(res.error.message);
      return;
    }

    await loadEvents();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      alert(error.message);
      return;
    }

    await loadEvents();
  };

  const handleEdit = (event: Event) => {
    setFormData({
      ...event,
      event_date: event.event_date ? toDatetimeLocalValue(event.event_date) : null,
      end_date: event.end_date ? toDatetimeLocalValue(event.end_date) : null,
      title: event.title ?? '',
      slug: event.slug ?? '',
      description: event.description ?? '',
      location: event.location ?? '',
      image_url: event.image_url ?? '',
      registration_url: event.registration_url ?? '',
      form_id: event.form_id ?? null,
      is_featured: event.is_featured ?? false,
      is_published: event.is_published ?? false,
    });

    setEditingId(event.id ?? null);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      location: '',
      event_date: null,
      end_date: null,
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
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({
              title: '',
              slug: '',
              description: '',
              location: '',
              event_date: null,
              end_date: null,
              image_url: '',
              registration_url: '',
              form_id: null,
              is_featured: false,
              is_published: false,
            });
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Event
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Event</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title ?? ''}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData((p) => ({
                    ...p,
                    title,
                    slug: p.slug?.trim() ? p.slug : slugify(title),
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug <span className="text-xs text-gray-500">(auto)</span>
              </label>
              <input
                type="text"
                value={formData.slug ?? ''}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                placeholder={autoSlug}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location ?? ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Event Date <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.event_date ?? ''}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Date <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_date ?? ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
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
                value={formData.registration_url ?? ''}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Used if no form is selected"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUpload
                label="Event Image"
                value={formData.image_url ?? ''}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <RichTextEditor
                value={formData.description ?? ''}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter event description..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured ?? false}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="text-sm font-medium">Featured</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published ?? false}
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
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
            <div>
              <h3 className="font-bold">{event.title || '(Untitled event)'}</h3>
              <p className="text-sm text-gray-600">
                {(event.location || 'No location')}
                {event.event_date ? ` • ${new Date(event.event_date).toLocaleString()}` : ' • Date TBA'}
              </p>
              <div className="flex gap-2 mt-1">
                {event.is_featured && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Featured</span>
                )}
                {event.is_published && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Published</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => event.id && handleDelete(event.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
                disabled={!event.id}
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
