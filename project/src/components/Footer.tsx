import { useEffect, useState } from 'react';
import { Facebook, MessageCircle, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { loadPageSettings, PageSettings as FooterPageSettings, createGetSetting } from '../utils/pageSettings';

interface SiteSettings {
  site_name: string;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  social_facebook: string;
  social_whatsapp: string;
  social_instagram: string;
  social_youtube: string;
}

export default function Footer() {
  const { currentLanguage, translateContent } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageSettings, setPageSettings] = useState<FooterPageSettings>({});

  useEffect(() => {
    loadSettings();
    loadFooterSettings();
  }, [currentLanguage]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (data) {
      const translated = await translateContent(data, ['site_name', 'footer_text']);
      setSettings(translated);
    }
  };

  const loadFooterSettings = async () => {
    const data = await loadPageSettings('footer');
    setPageSettings(data);
  };

  const getSetting = createGetSetting(pageSettings);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-primary-400 min-h-[32px]">
              {settings?.site_name || 'Wellness Center'}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {settings?.footer_text || 'Transform your life through meditation, yoga, and holistic wellness practices.'}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 min-h-[28px]">{getSetting('quick_links_heading', 'Quick Links')}</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition inline-block">Home</a></li>
              <li><a href="/programs" className="text-gray-400 hover:text-primary-400 transition inline-block">Programs</a></li>
              <li><a href="/courses" className="text-gray-400 hover:text-primary-400 transition inline-block">Courses</a></li>
              <li><a href="/gallery" className="text-gray-400 hover:text-primary-400 transition inline-block">Gallery</a></li>
              <li><a href="/articles" className="text-gray-400 hover:text-primary-400 transition inline-block">Articles</a></li>
              <li><a href="/events" className="text-gray-400 hover:text-primary-400 transition inline-block">Events</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 min-h-[28px]">{getSetting('contact_heading', 'Contact Us')}</h4>
            <div className="space-y-4">
              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center space-x-3 text-gray-400 hover:text-primary-400 transition group"
                >
                  <div className="bg-primary-600 p-2 rounded group-hover:bg-primary-500 transition flex-shrink-0">
                    <Mail size={20} className="text-white" />
                  </div>
                  <span className="break-all text-sm">{settings.contact_email}</span>
                </a>
              )}
              {settings?.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center space-x-3 text-gray-400 hover:text-primary-400 transition group"
                >
                  <div className="bg-primary-600 p-2 rounded group-hover:bg-primary-500 transition flex-shrink-0">
                    <Phone size={20} className="text-white" />
                  </div>
                  <span className="text-sm">{settings.contact_phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {new Date().getFullYear()} {settings?.site_name || 'Wellness Center'}. {getSetting('rights_text', 'All rights reserved.')}
            </p>
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-sm">{getSetting('follow_us_text', 'Follow us:')}</p>
              <div className="flex items-center gap-4">
                {settings?.social_facebook && (
                  <a
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-400 transition transform hover:scale-110"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {settings?.social_whatsapp && (
                  <a
                    href={`https://wa.me/${settings.social_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-400 transition transform hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={20} />
                  </a>
                )}
                {settings?.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-400 transition transform hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {settings?.social_youtube && (
                  <a
                    href={settings.social_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-400 transition transform hover:scale-110"
                    aria-label="YouTube"
                  >
                    <Youtube size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
