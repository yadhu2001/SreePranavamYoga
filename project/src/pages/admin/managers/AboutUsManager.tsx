import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ImageUpload';

interface AboutSection {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
}

interface AboutSettings {
  id?: string; // optional: row may not exist yet
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  vision: string;
  mission: string;
  core_values: string;
}

export default function AboutUsManager() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [settings, setSettings] = useState<AboutSettings | null>(null);

  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const [editingSection, setEditingSection] = useState<Partial<AboutSection>>({});
  const [editingSettings, setEditingSettings] = useState<Partial<AboutSettings>>({});

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsRes, settingsRes] = await Promise.all([
        supabase.from('about_us_sections').select('*').order('display_order', { ascending: true }),
        supabase.from('about_us_settings').select('*').limit(1).maybeSingle(),
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setSections(sectionsRes.data || []);
      setSettings(settingsRes.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async () => {
    if (!editingSection.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      if (editingSection.id) {
        const { error } = await supabase
          .from('about_us_sections')
          .update({
            title: editingSection.title ?? '',
            content: editingSection.content ?? '',
            image_url: editingSection.image_url ?? null,
            is_published: editingSection.is_published ?? true,
            display_order: editingSection.display_order ?? 0,
          })
          .eq('id', editingSection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('about_us_sections').insert([
          {
            title: editingSection.title ?? '',
            content: editingSection.content ?? '',
            image_url: editingSection.image_url ?? null,
            is_published: editingSection.is_published ?? true,
            display_order: sections.length,
          },
        ]);

        if (error) throw error;
      }

      await fetchData();
      setIsEditingSection(false);
      setEditingSection({});
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;

    try {
      const { error } = await supabase.from('about_us_sections').delete().eq('id', id);
      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const togglePublishSection = async (section: AboutSection) => {
    try {
      const { error } = await supabase
        .from('about_us_sections')
        .update({ is_published: !section.is_published })
        .eq('id', section.id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  // Creates row if missing, updates if exists
  const handleSaveSettings = async () => {
    if (!editingSettings.hero_title?.trim()) {
      alert('Please enter a hero title');
      return;
    }

    try {
      const payload: AboutSettings = {
        id: settings?.id, // keep existing id if present; if null, upsert will insert a row
        hero_title: editingSettings.hero_title ?? 'About Us',
        hero_subtitle: editingSettings.hero_subtitle ?? '',
        hero_image_url: editingSettings.hero_image_url ?? null,
        vision: editingSettings.vision ?? '',
        mission: editingSettings.mission ?? '',
        core_values: editingSettings.core_values ?? '',
      };

      // Remove undefined id if not present (clean payload)
      const cleanPayload: any = { ...payload };
      if (!cleanPayload.id) delete cleanPayload.id;

      const { error } = await supabase.from('about_us_settings').upsert(cleanPayload, {
        defaultToNull: false,
      });

      if (error) throw error;

      await fetchData();
      setIsEditingSettings(false);
      setEditingSettings({});
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">About Us Manager</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingSettings(settings || {});
              setIsEditingSettings(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 size={20} />
            Edit Hero Section
          </button>

          <button
            onClick={() => {
              setEditingSection({ content: '', is_published: true });
              setIsEditingSection(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus size={20} />
            New Section
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Content Sections</h3>

        <div className="space-y-3">
          {sections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sections yet</p>
          ) : (
            sections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{section.title}</h4>
                      <div
                        className="text-sm text-gray-600 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => togglePublishSection(section)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title={section.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {section.is_published ? (
                        <Eye size={16} className="text-primary-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingSection(section);
                        setIsEditingSection(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {section.image_url && (
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="mt-3 w-32 h-20 object-cover rounded"
                  />
                )}

                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      section.is_published
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {section.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section Edit Modal */}
      {isEditingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingSection.id ? 'Edit Section' : 'New Section'}
              </h3>
              <button
                onClick={() => {
                  setIsEditingSection(false);
                  setEditingSection({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Section title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <RichTextEditor
                  value={editingSection.content || ''}
                  onChange={(value) => setEditingSection({ ...editingSection, content: value })}
                  placeholder="Write your content here..."
                />
              </div>

              <ImageUpload
                label="Section Image (Optional)"
                value={editingSection.image_url || ''}
                onChange={(url) => setEditingSection({ ...editingSection, image_url: url })}
                bucketName="about-us"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish-section"
                  checked={editingSection.is_published ?? true}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, is_published: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="publish-section" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveSection}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  Save Section
                </button>
                <button
                  onClick={() => {
                    setIsEditingSection(false);
                    setEditingSection({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Edit Modal */}
      {isEditingSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Edit Hero Section</h3>
              <button
                onClick={() => {
                  setIsEditingSettings(false);
                  setEditingSettings({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={editingSettings.hero_title || ''}
                  onChange={(e) =>
                    setEditingSettings({ ...editingSettings, hero_title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={editingSettings.hero_subtitle || ''}
                  onChange={(e) =>
                    setEditingSettings({ ...editingSettings, hero_subtitle: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Learn more about our wellness center"
                />
              </div>

              <ImageUpload
                label="Hero Background Image (Optional)"
                value={editingSettings.hero_image_url || ''}
                onChange={(url) =>
                  setEditingSettings({ ...editingSettings, hero_image_url: url })
                }
                bucketName="about-us"
              />

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Vision, Mission & Our Actvities</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
                    <RichTextEditor
                      value={editingSettings.vision || ''}
                      onChange={(value) => setEditingSettings({ ...editingSettings, vision: value })}
                      placeholder="Describe your organization's vision..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                    <RichTextEditor
                      value={editingSettings.mission || ''}
                      onChange={(value) =>
                        setEditingSettings({ ...editingSettings, mission: value })
                      }
                      placeholder="Describe your organization's mission..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Our Activities</label>
                    <RichTextEditor
                      value={editingSettings.core_values || ''}
                      onChange={(value) =>
                        setEditingSettings({ ...editingSettings, core_values: value })
                      }
                      placeholder="List your organization's core values..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <Save size={20} />
                  Save Settings
                </button>
                <button
                  onClick={() => {
                    setIsEditingSettings(false);
                    setEditingSettings({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
