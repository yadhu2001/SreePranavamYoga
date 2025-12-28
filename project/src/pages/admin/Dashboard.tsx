import { useState, useEffect } from 'react';
import {
  LogOut,
  Home,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Settings,
  Layers,
  Target,
  MessageSquare,
  HelpCircle,
  Navigation as NavIcon,
  Image,
  GraduationCap,
  Info,
  Type,
  Sparkles,
  ClipboardList,
  MapPin,
  Database,
  Languages
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProgramsManager from './managers/ProgramsManager';
import CoursesManager from './managers/CoursesManager';
import ArticlesManager from './managers/ArticlesManager';
import EventsManager from './managers/EventsManager';
import SolutionsManager from './managers/SolutionsManager';
import TestimonialsManager from './managers/TestimonialsManager';
import TeachersManager from './managers/TeachersManager';
import FAQsManager from './managers/FAQsManager';
import HeroManager from './managers/HeroManager';
import NavigationManager from './managers/NavigationManager';
import SettingsManager from './managers/SettingsManager';
import GalleryManager from './managers/GalleryManager';
import AboutUsManager from './managers/AboutUsManager';
import PageSettingsManager from './managers/PageSettingsManager';
import FeatureSectionManager from './managers/FeatureSectionManager';
import FormsManager from './managers/FormsManager';
import LocationsManager from './managers/LocationsManager';
import FormSubmissionsManager from './managers/FormSubmissionsManager';
import TranslationsManager from './managers/TranslationsManager';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('programs');
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const menuItems = [
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'features', label: 'Feature Sections', icon: Sparkles },
    { id: 'navigation', label: 'Navigation', icon: NavIcon },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'programs', label: 'Programs', icon: BookOpen },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'solutions', label: 'Solutions', icon: Target },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'forms', label: 'Registration Forms', icon: ClipboardList },
    { id: 'submissions', label: 'Form Submissions', icon: Database },
    { id: 'translations', label: 'Translations', icon: Languages },
    { id: 'page-text', label: 'Page Text', icon: Type },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">CMS Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Content Management</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition ${
                  activeTab === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 border-t border-gray-800 hover:bg-gray-800 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'hero' && <HeroManager />}
          {activeTab === 'features' && <FeatureSectionManager />}
          {activeTab === 'navigation' && <NavigationManager />}
          {activeTab === 'about' && <AboutUsManager />}
          {activeTab === 'locations' && <LocationsManager />}
          {activeTab === 'programs' && <ProgramsManager />}
          {activeTab === 'courses' && <CoursesManager />}
          {activeTab === 'solutions' && <SolutionsManager />}
          {activeTab === 'articles' && <ArticlesManager />}
          {activeTab === 'events' && <EventsManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'testimonials' && <TestimonialsManager />}
          {activeTab === 'teachers' && <TeachersManager />}
          {activeTab === 'faqs' && <FAQsManager />}
          {activeTab === 'forms' && <FormsManager />}
          {activeTab === 'submissions' && <FormSubmissionsManager />}
          {activeTab === 'translations' && <TranslationsManager />}
          {activeTab === 'page-text' && <PageSettingsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}
