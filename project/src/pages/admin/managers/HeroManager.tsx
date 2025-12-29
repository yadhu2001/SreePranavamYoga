import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface Hero {
  id?: string;
  title: string;
  subtitle: string;
  background_image: string;
  background_video: string;
  cta_text: string;
  cta_url: string;
  is_active: boolean;
  sort_order: number;

  // dynamic fields (must be present in DB)
  title_font_size: number | null;
  subtitle_font_size: number | null;
  subtitle_same_as_title: boolean | null;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function FontSizeControl({
  label,
  value,
  onChange,
  min = 12,
  max = 120,
  disabled = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? 'opacity-60 pointer-events-none' : ''}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{value ?? '-'}px</span>
          <input
            type="number"
            min={min}
            max={max}
            value={value ?? ''}
            onChange={(e) => onChange(clamp(Number(e.target.value || 0), min, max))}
            className="w-24 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="px"
          />
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value ?? min}
        onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
        className="w-full"
      />
    </div>
  );
}

export default function HeroManager() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Hero | null>(null);

  useEffect(() => {
    loadHeroes();
  }, []);

  const loadHeroes = async () => {
    const { data } = await supabase.from('hero_sections').select('*').order('sort_order');
    if (data) setHeroes(data as Hero[]);
  };

  const startCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setFormData({
      title: '',
      subtitle: '',
      background_image: '',
      background_video: '',
      cta_text: '',
      cta_url: '',
      is_active: true,
      sort_order: 0,

      // ✅ no defaults in code
      title_font_size: null,
      subtitle_font_size: null,
      subtitle_same_as_title: false,
    });
  };

  const handleEdit = (hero: Hero) => {
    setFormData(hero);
    setEditingId(hero.id!);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData(null);
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData) return;

    // ✅ Block save if dynamic values are missing
    if (formData.title_font_size == null) {
      alert('Please set Title Font Size.');
      return;
    }

    const same = !!formData.subtitle_same_as_title;

    if (!same && formData.subtitle_font_size == null) {
      alert('Please set Subtitle Font Size (or enable Same size as Title).');
      return;
    }

    const payload = {
      ...formData,
      title_font_size: clamp(formData.title_font_size, 14, 120),
      subtitle_same_as_title: same,
      subtitle_font_size: same
        ? clamp(formData.title_font_size, 12, 120)
        : clamp(formData.subtitle_font_size as number, 12, 120),
    };

    if (editingId) {
      await supabase.from('hero_sections').update(payload).eq('id', editingId);
    } else {
      const maxOrder = Math.max(0, ...heroes.map((h) => h.sort_order || 0));
      await supabase.from('hero_sections').insert({ ...payload, sort_order: maxOrder + 1 });
    }

    await loadHeroes();
    resetForm();
  };

  const handleToggleActive = async (hero: Hero) => {
    await supabase.from('hero_sections').update({ is_active: !hero.is_active }).eq('id', hero.id);
    loadHeroes();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = heroes.findIndex((h) => h.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === heroes.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const current = heroes[currentIndex];
    const target = heroes[targetIndex];

    await Promise.all([
      supabase.from('hero_sections').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('hero_sections').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);

    loadHeroes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('hero_sections').delete().eq('id', id);
      loadHeroes();
    }
  };

  const effectiveSubtitleSize =
    formData?.subtitle_same_as_title && formData?.title_font_size != null
      ? formData.title_font_size
      : formData?.subtitle_font_size;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Hero Sections</h2>
        <button
          onClick={startCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Hero Section
        </button>
      </div>

      {isCreating && formData && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Hero Section</h3>

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

            <FontSizeControl
              label="Title Font Size"
              value={formData.title_font_size}
              onChange={(v) =>
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        title_font_size: v,
                        subtitle_font_size: prev.subtitle_same_as_title ? v : prev.subtitle_font_size,
                      }
                    : prev
                )
              }
            />

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Subtitle</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.subtitle_same_as_title}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({
                      ...formData,
                      subtitle_same_as_title: checked,
                      subtitle_font_size: checked ? formData.title_font_size : formData.subtitle_font_size,
                    });
                  }}
                />
                <span>Same size as Title</span>
              </label>
            </div>

            <RichTextEditor
              value={formData.subtitle}
              onChange={(value) => setFormData({ ...formData, subtitle: value })}
              placeholder="Enter subtitle text..."
            />

            <FontSizeControl
              label="Subtitle Font Size"
              value={effectiveSubtitleSize ?? null}
              onChange={(v) => setFormData({ ...formData, subtitle_font_size: v })}
              disabled={!!formData.subtitle_same_as_title}
            />

            <ImageUpload
              label="Background Image"
              value={formData.background_image}
              onChange={(url) => setFormData({ ...formData, background_image: url })}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Background Video URL (Optional)</label>
              <input
                type="text"
                value={formData.background_video}
                onChange={(e) => setFormData({ ...formData, background_video: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CTA Button URL</label>
                <input
                  type="text"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
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
        {heroes.map((hero, index) => (
          <div
            key={hero.id}
            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
              hero.is_active ? 'border-primary-500' : 'border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{hero.title}</h3>
                  {hero.is_active ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Title: {hero.title_font_size ?? 'NULL'}px • Subtitle:{' '}
                  {(hero.subtitle_same_as_title ? hero.title_font_size : hero.subtitle_font_size) ?? 'NULL'}px
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleReorder(hero.id!, 'up')}
                    disabled={index === 0}
                    className={`p-2 rounded ${
                      index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => handleReorder(hero.id!, 'down')}
                    disabled={index === heroes.length - 1}
                    className={`p-2 rounded ${
                      index === heroes.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleActive(hero)}
                    className={`p-2 rounded ${
                      hero.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {hero.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button onClick={() => handleEdit(hero)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(hero.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
