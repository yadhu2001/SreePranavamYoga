import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import EventNotificationBanner from './components/EventNotificationBanner';
import FloatingLanguageSwitcher from './components/FloatingLanguageSwitcher';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Teachers from './pages/Teachers';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function AppContent() {
  const [currentPath, setCurrentPath] = useState('/');
  const [showAdmin, setShowAdmin] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path);
    if (path.startsWith('/admin')) {
      setShowAdmin(true);
    }

    const handlePopState = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath);
      setShowAdmin(newPath.startsWith('/admin'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    if (path.startsWith('/admin')) {
      setShowAdmin(true);
    } else {
      setShowAdmin(false);
    }
    window.scrollTo(0, 0);
  };

  if (showAdmin) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Login onLogin={() => navigate('/admin')} />;
    }

    return <Dashboard onLogout={() => navigate('/')} />;
  }

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <Home onNavigate={navigate} />;
    } else if (currentPath === '/about' || currentPath.startsWith('/about')) {
      return <AboutUs />;
    } else if (currentPath.startsWith('/programs/')) {
      const programId = currentPath.split('/programs/')[1];
      return <ProgramDetail programId={programId} onNavigate={navigate} />;
    } else if (currentPath === '/programs') {
      return <Programs onNavigate={navigate} />;
    } else if (currentPath.startsWith('/courses/')) {
      const courseId = currentPath.split('/courses/')[1];
      return <CourseDetail courseId={courseId} onNavigate={navigate} />;
    } else if (currentPath === '/courses') {
      return <Courses onNavigate={navigate} />;
    } else if (currentPath.startsWith('/articles/')) {
      const articleSlug = currentPath.split('/articles/')[1];
      return <ArticleDetail articleSlug={articleSlug} onNavigate={navigate} />;
    } else if (currentPath === '/articles') {
      return <Articles onNavigate={navigate} />;
    } else if (currentPath === '/events' || currentPath.startsWith('/events')) {
      return <Events />;
    } else if (currentPath === '/gallery' || currentPath.startsWith('/gallery')) {
      return <Gallery />;
    } else if (currentPath === '/teachers' || currentPath.startsWith('/teachers')) {
      return <Teachers />;
    } else {
      return <Home onNavigate={navigate} />;
    }
  };

  // ✅ Hide floating language switcher only on Home page
  const isHomePage = currentPath === '/' || currentPath === '';

  return (
    <div className="flex flex-col min-h-screen">
      {!showAdmin && <EventNotificationBanner />}
      {!showAdmin && <Header onNavigate={navigate} currentPath={currentPath} />}
      <main className="flex-1">{renderPage()}</main>
      {!showAdmin && <Footer />}

      {/* ✅ Hide only on Home */}
      {!showAdmin && !isHomePage && <FloatingLanguageSwitcher />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
