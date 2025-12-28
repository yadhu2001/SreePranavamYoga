import { useEffect, useState } from 'react';
import { Calendar, User, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { loadPageSettings, PageSettings, createGetSetting } from '../utils/pageSettings';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  image_url: string;
  category: string;
  published_at: string;
}

interface ArticlesProps {
  onNavigate: (path: string) => void;
}

export default function Articles({ onNavigate }: ArticlesProps) {
  const { currentLanguage, translateContent, translateList } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article | null>(null);
  const [settings, setSettings] = useState<PageSettings>({});

  useEffect(() => {
    loadArticles();
    loadSettings();
  }, [currentLanguage]);

  const loadArticles = async () => {
    const [featuredData, articlesData] = await Promise.all([
      supabase.from('articles').select('*').eq('is_published', true).eq('is_featured', true).limit(1).single(),
      supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false }),
    ]);

    if (featuredData.data) {
      const translated = await translateContent(featuredData.data, ['title', 'excerpt', 'author', 'category']);
      setFeatured(translated);
    }
    if (articlesData.data) {
      const translated = await translateList(articlesData.data, ['title', 'excerpt', 'author', 'category']);
      setArticles(translated);
    }
  };

  const loadSettings = async () => {
    const data = await loadPageSettings('articles');
    setSettings(data);
  };

  const getSetting = createGetSetting(settings);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{getSetting('page_heading', 'Wisdom & Insights')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getSetting('page_subheading', 'Explore articles on wellness, mindfulness, and personal growth')}
          </p>
        </div>

        {featured && (
          <div className="mb-12 bg-white rounded-xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <img src={featured.image_url} alt={featured.title} className="w-full h-96 object-cover" />
              <div className="p-8 flex flex-col justify-center">
                <span className="text-sm font-semibold text-primary-600 uppercase mb-2">{getSetting('featured_label', 'Featured Article')}</span>
                <h2 className="text-3xl font-bold mb-4">{featured.title}</h2>
                <p className="text-gray-600 mb-4 text-lg">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <User size={16} /> {featured.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> {formatDate(featured.published_at)}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate(`/articles/${featured.slug}`)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-flex items-center w-fit"
                >
                  {getSetting('read_article_button', 'Read Article')} <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col h-full">
              <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover flex-shrink-0" />
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full inline-block w-fit mb-3">
                  {article.category}
                </span>
                <h3 className="text-xl font-bold mb-2 line-clamp-2 min-h-[3.5rem]">{article.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 min-h-[20px]">
                  <span className="flex items-center gap-1">
                    <User size={14} /> {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(article.published_at)}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate(`/articles/${article.slug}`)}
                  className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center mt-auto"
                >
                  {getSetting('read_more_button', 'Read More')} <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
