import { useState, useEffect } from 'react';
import { Save, Type } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PageSetting {
  id: string;
  page: string;
  key: string;
  value: string;
  description: string;
}

interface GroupedSettings {
  [page: string]: PageSetting[];
}

export default function PageSettingsManager() {
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('page_settings')
      .select('*')
      .order('page')
      .order('key');

    if (error) {
      console.error('Error loading settings:', error);
      setMessage('Error loading settings');
    } else if (data) {
      const grouped = data.reduce((acc, setting) => {
        if (!acc[setting.page]) {
          acc[setting.page] = [];
        }
        acc[setting.page].push(setting);
        return acc;
      }, {} as GroupedSettings);
      setSettings(grouped);
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].page);
      }
    }
    setLoading(false);
  };

  const handleUpdate = (page: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [page]: prev[page].map(setting =>
        setting.key === key ? { ...setting, value } : setting
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const allSettings = Object.values(settings).flat();

      const updates = allSettings.map(setting =>
        supabase
          .from('page_settings')
          .update({ value: setting.value })
          .eq('id', setting.id)
      );

      await Promise.all(updates);
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getPageDisplayName = (page: string) => {
    const names: { [key: string]: string } = {
      'home': 'Home Page',
      'hero': 'Hero Section',
      'programs': 'Programs Page',
      'teachers': 'Teachers Page',
      'articles': 'Articles Page',
      'events': 'Events Page',
      'gallery': 'Gallery Page',
      'footer': 'Footer',
      'header': 'Header'
    };
    return names[page] || page;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const pages = Object.keys(settings);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Type size={28} />
          Page Text Settings
        </h2>
        <p className="text-gray-600">Edit all text that appears on your website pages</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b">
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setActiveTab(page)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === page
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              {getPageDisplayName(page)}
            </button>
          ))}
        </div>
      </div>

      {settings[activeTab] && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {settings[activeTab].map(setting => (
              <div key={setting.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  {setting.description && (
                    <span className="block text-xs font-normal text-gray-500 mt-1">
                      {setting.description}
                    </span>
                  )}
                </label>
                {setting.value.length > 100 ? (
                  <textarea
                    value={setting.value}
                    onChange={(e) => handleUpdate(activeTab, setting.key, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleUpdate(activeTab, setting.key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
