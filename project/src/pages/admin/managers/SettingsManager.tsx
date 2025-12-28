import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SiteSettings {
  id?: string; // optional because the row may not exist yet
  site_name: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_whatsapp: string;
  footer_text: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Wellness Center',
  tagline: '',
  logo_url: '',
  primary_color: '#0f4c5c',
  secondary_color: '#f5f5f5',
  contact_email: '',
  contact_phone: '',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_whatsapp: '',
  footer_text: '',
};

export default function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // NEW: logo file + preview
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const loadSettings = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error loading settings:', error);
      setMessage('Error loading settings');
      setSettings(DEFAULT_SETTINGS);
      setLogoFile(null);
      setLogoPreview('');
      setLoading(false);
      return;
    }

    const merged = data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
    setSettings(merged);

    // preview should show stored url if present
    setLogoFile(null);
    setLogoPreview(merged.logo_url ?? '');

    setLoading(false);
  };

  const onPickLogo = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image too large. Please use <= 2MB.');
      return;
    }

    setLogoFile(file);

    // revoke previous blob preview (if any) before creating a new one
    setLogoPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  // Upload to Supabase Storage bucket: site-assets (PUBLIC bucket recommended)
  const uploadLogoToSupabase = async (file: File) => {
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `logo-${Date.now()}.${ext}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Public URL (works only if bucket is PUBLIC)
    const { data } = supabase.storage.from('site-assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let finalLogoUrl = settings.logo_url;

      // If user selected a file, upload it first and store URL in DB
      if (logoFile) {
        finalLogoUrl = await uploadLogoToSupabase(logoFile);
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            ...settings,
            logo_url: finalLogoUrl,
            updated_at: new Date().toISOString(), // if your table has updated_at
          } as any,
          { defaultToNull: false }
        );

      if (error) throw error;

      setMessage('Settings saved successfully!');
      await loadSettings();
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Site Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input
                type="text"
                value={settings.site_name ?? ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline ?? ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* UPDATED: Logo upload + preview + optional URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Logo</label>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Preview */}
                <div className="w-32 h-32 border rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No preview</span>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  {/* File input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)}
                    className="w-full"
                  />

                  {/* Optional: still allow URL paste */}
                  <input
                    type="text"
                    value={settings.logo_url ?? ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setSettings({ ...settings, logo_url: url });

                      // URL preview
                      setLogoPreview((prev) => {
                        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
                        return url;
                      });

                      // If user is manually setting a URL, ignore selected file
                      setLogoFile(null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Or paste logo URL"
                  />

                  <p className="text-xs text-gray-500">
                    Choose an image to upload, or paste a URL. (Max 2MB recommended)
                  </p>
                </div>
              </div>
            </div>

            {/* (Optional) You can keep these if you want to manage colors here later */}
            {/* primary_color / secondary_color fields are in DB but not displayed in your UI currently */}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={settings.contact_email ?? ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={settings.contact_phone ?? ''}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="text"
                value={settings.social_facebook ?? ''}
                onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="text"
                value={settings.social_whatsapp ?? ''}
                onChange={(e) => setSettings({ ...settings, social_whatsapp: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="919876543210"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter phone number with country code (no + or spaces)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={settings.social_instagram ?? ''}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube</label>
              <input
                type="text"
                value={settings.social_youtube ?? ''}
                onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Footer</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Text</label>
            <textarea
              value={settings.footer_text ?? ''}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
