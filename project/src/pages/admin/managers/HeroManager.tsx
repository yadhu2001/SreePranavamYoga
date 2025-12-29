import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface Hero {
  id?: string;

  // DESKTOP TEXT (3 sections)
  title: string;         // "Transformative"
  middle_text: string;   // "With"
  subtitle: string;      // "Acharya Praveen" (can be simple text or rich text)

  background_image: string;
  background_video: string;
  cta_text: string;
  cta_url: string;
  is_active: boolean;
  sort_order: number;

  // DESKTOP FONT SIZES
  title_font_size: number | null;
  middle_font_size: number | null;
  subtitle_font_size: number | null;

  // MOBILE OVERRIDES (optional)
  mobile_title: string | null;
  mobile_middle_text: string | null;
  mobile_subtitle: string | null;

  mobile_title_font_size: number | null;
  mobile_middle_font_size: number | null;
  mobile_subtitle_font_size: number | null;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function FontSizeControl({
  label,
  value,
  onChange,
  min = 12,
  max = 140,
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
      middle_text: '',
      subtitle: '',

      background_image: '',
      background_video: '',
      cta_text: '',
      cta_url: '',
      is_active: true,
      sort_order: 0,

      title_font_size: null,
      middle_font_size: null,
      subtitle_font_size: null,

      mobile_title: null,
      mobile_middle_text: null,
      mobile_subtitle: null,

      mobile_title_font_size: null,
      mobile_middle_font_size: null,
      mobile_subtitle_font_size: null,
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

    // ✅ Required desktop sizes
    if (formData.title_font_size == null) return alert('Please set Desktop Title Font Size.');
    if (formData.middle_font_size == null) return alert('Please set Desktop Middle Text Font Size.');
    if (formData.subtitle_font_size == null) return alert('Please set Desktop Subtitle Font Size.');

    const payload: Hero = {
      ...formData,

      // clamp desktop
      title_font_size: clamp(formData.title_font_size, 14, 140),
      middle_font_size: clamp(formData.middle_font_size, 10, 120),
      subtitle_font_size: clamp(formData.subtitle_font_size, 10, 120),

      // clamp mobile if provided
      mobile_title_font_size:
        formData.mobile_title_font_size == null ? null : clamp(formData.mobile_title_font_size, 12, 120),
      mobile_middle_font_size:
        formData.mobile_middle_font_size == null ? null : clamp(formData.mobile_middle_font_size, 10, 100),
      mobile_subtitle_font_size:
        formData.mobile_subtitle_font_size == null ? null : clamp(formData.mobile_subtitle_font_size, 10, 110),
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

  if (!formData) {
    // still show list even without create/edit open
  }

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

          <div className="space-y-8">
            {/* =========================
                DESKTOP CONTENT (3 parts)
            ========================== */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-4">Desktop Content</h4>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title (Top)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Transformative"
                  />
                </div>

                <FontSizeControl
                  label="Title Font Size (Desktop)"
                  value={formData.title_font_size}
                  onChange={(v) => setFormData({ ...formData, title_font_size: v })}
                  min={14}
                  max={140}
                />

                {/* Middle text */}
                <div>
                  <label className="block text-sm font-medium mb-1">Middle Text (Center)</label>
                  <input
                    type="text"
                    value={formData.middle_text}
                    onChange={(e) => setFormData({ ...formData, middle_text: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. With"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This controls only the middle word/sentence (example: “With”).
                  </p>
                </div>

                <FontSizeControl
                  label="Middle Text Font Size (Desktop)"
                  value={formData.middle_font_size}
                  onChange={(v) => setFormData({ ...formData, middle_font_size: v })}
                  min={10}
                  max={120}
                />

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle (Bottom)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Acharya Praveen"
                  />
                </div>

                <FontSizeControl
                  label="Subtitle Font Size (Desktop)"
                  value={formData.subtitle_font_size}
                  onChange={(v) => setFormData({ ...formData, subtitle_font_size: v })}
                  min={10}
                  max={120}
                />
              </div>
            </div>

            {/* =========================
                MOBILE OVERRIDES (optional)
            ========================== */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-2">Mobile Overrides (Optional)</h4>
              <p className="text-sm text-gray-500 mb-4">
                If left empty, desktop content will be used on mobile.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Title</label>
                  <input
                    type="text"
                    value={formData.mobile_title ?? ''}
                    onChange={(e) => setFormData({ ...formData, mobile_title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional"
                  />
                </div>

                <FontSizeControl
                  label="Mobile Title Font Size"
                  value={formData.mobile_title_font_size}
                  onChange={(v) => setFormData({ ...formData, mobile_title_font_size: v })}
                  min={12}
                  max={90}
                />

                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Middle Text</label>
                  <input
                    type="text"
                    value={formData.mobile_middle_text ?? ''}
                    onChange={(e) => setFormData({ ...formData, mobile_middle_text: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional"
                  />
                </div>

                <FontSizeControl
                  label="Mobile Middle Text Font Size"
                  value={formData.mobile_middle_font_size}
                  onChange={(v) => setFormData({ ...formData, mobile_middle_font_size: v })}
                  min={10}
                  max={70}
                />

                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Subtitle</label>
                  <input
                    type="text"
                    value={formData.mobile_subtitle ?? ''}
                    onChange={(e) => setFormData({ ...formData, mobile_subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional"
                  />
                </div>

                <FontSizeControl
                  label="Mobile Subtitle Font Size"
                  value={formData.mobile_subtitle_font_size}
                  onChange={(v) => setFormData({ ...formData, mobile_subtitle_font_size: v })}
                  min={10}
                  max={80}
                />
              </div>
            </div>

            {/* =========================
                BACKGROUND / CTA
            ========================== */}
            <div className="space-y-4">
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

            <div className="flex gap-2 mt-2">
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
        </div>
      )}

      {/* LIST */}
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
                  Desktop sizes: Title {hero.title_font_size ?? 'NULL'}px • Middle {hero.middle_font_size ?? 'NULL'}px •
                  Subtitle {hero.subtitle_font_size ?? 'NULL'}px
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
