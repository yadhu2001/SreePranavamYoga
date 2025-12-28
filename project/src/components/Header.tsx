import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadPageSettings, PageSettings as HeaderPageSettings, createGetSetting } from '../utils/pageSettings';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
  children?: NavigationItem[];
}

interface Program {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
}

interface SiteSettings {
  site_name: string;
  tagline: string;
  logo_url: string; // ✅ added
}

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export default function Header({ onNavigate, currentPath }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageSettings, setPageSettings] = useState<HeaderPageSettings>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadNavigation();
    loadPrograms();
    loadSettings();
    loadHeaderSettings();
    setOpenDropdown(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNavigation = async () => {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error loading navigation:', error);
      return;
    }

    if (data) {
      const parentItems = data.filter((item: NavigationItem) => !item.parent_id);
      const navWithChildren = parentItems.map((parent: NavigationItem) => ({
        ...parent,
        children: data.filter((item: NavigationItem) => item.parent_id === parent.id),
      }));
      setNavigation(navWithChildren);
    }
  };

  const loadPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('id, title, slug, is_published')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading programs:', error);
      return;
    }

    if (data) setPrograms(data);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('site_name, tagline, logo_url') // ✅ include logo_url
      .maybeSingle();

    if (error) {
      console.error('Error loading site settings:', error);
      return;
    }

    if (data) setSettings(data as SiteSettings);
  };

  const loadHeaderSettings = async () => {
    const data = await loadPageSettings('header');
    setPageSettings(data || {});
  };

  const getSetting = createGetSetting(pageSettings);

  const handleNavigate = (url: string) => {
    onNavigate(url);
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const isProgramsLink = (url: string) => url === '/programs' || url.startsWith('/programs');

  const getProgramsChildren = () => {
    if (programs.length >= 2) {
      return programs.map((program) => ({
        id: program.id,
        label: program.title,
        url: `/programs/${program.slug || program.id}`,
        parent_id: null,
      }));
    }
    return [];
  };

  const handleProgramsClick = (url: string) => {
    if (programs.length === 1) {
      const single = programs[0];
      handleNavigate(`/programs/${single.slug || single.id}`);
    } else {
      handleNavigate(url);
    }
  };

  const getDropdownChildren = (item: NavigationItem) => {
    const programsChildren = isProgramsLink(item.url) ? getProgramsChildren() : [];
    if (programsChildren.length > 0) return programsChildren;
    return item.children || [];
  };

  const brandName = settings?.site_name || 'Wellness Center';
  const brandLogo = settings?.logo_url || '';

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ✅ UPDATED BRAND: logo + name */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-3 text-primary-600 hover:text-primary-700 transition"
            aria-label="Go to home"
          >
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={`${brandName} logo`}
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  // if url is broken, hide image gracefully
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}

            <span className="text-2xl font-bold">{brandName}</span>
          </button>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const children = getDropdownChildren(item);
              const hasDropdown = children.length > 0;

              return (
                <div key={item.id} className="relative group">
                  {hasDropdown ? (
                    <div>
                      <button
                        onClick={() => {
                          if (isProgramsLink(item.url)) {
                            if (getProgramsChildren().length === 0) {
                              handleProgramsClick(item.url);
                              return;
                            }
                          }
                          handleNavigate(item.url);
                        }}
                        className={`flex items-center gap-1 text-gray-700 hover:text-primary-600 transition font-medium ${
                          currentPath === item.url || currentPath.startsWith(item.url) ? 'text-primary-600' : ''
                        }`}
                      >
                        {item.label}
                        <ChevronDown size={16} />
                      </button>

                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                        <div className="py-2">
                          {children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleNavigate(child.url)}
                              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (isProgramsLink(item.url)) handleProgramsClick(item.url);
                        else handleNavigate(item.url);
                      }}
                      className={`text-gray-700 hover:text-primary-600 transition font-medium ${
                        currentPath === item.url ? 'text-primary-600' : ''
                      }`}
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => handleNavigate('/admin')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              {getSetting('admin_button', 'Admin')}
            </button>
          </nav>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navigation.map((item) => {
              const children = getDropdownChildren(item);
              const hasDropdown = children.length > 0;

              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (isProgramsLink(item.url)) {
                          if (getProgramsChildren().length === 0) handleProgramsClick(item.url);
                          else setOpenDropdown(openDropdown === item.id ? null : item.id);
                          return;
                        }
                        handleNavigate(item.url);
                      }}
                      className={`flex-1 text-left px-4 py-2 text-gray-700 hover:bg-primary-50 rounded transition ${
                        currentPath === item.url ? 'text-primary-600 bg-primary-50' : ''
                      }`}
                    >
                      {item.label}
                    </button>

                    {hasDropdown && (
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                        className="px-3 py-2"
                        aria-label="Toggle dropdown"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasDropdown && openDropdown === item.id && (
                    <div className="ml-4 space-y-1">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleNavigate(child.url)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded transition"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => handleNavigate('/admin')}
              className="block w-full text-left px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              {getSetting('admin_button', 'Admin')}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
