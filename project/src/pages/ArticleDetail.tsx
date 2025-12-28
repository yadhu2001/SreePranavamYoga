import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  author_image: string;
  image_url: string;
  category: string;
  published_at: string;
}

interface ArticleDetailProps {
  articleSlug: string;
  onNavigate: (path: string) => void;
}

export default function ArticleDetail({ articleSlug, onNavigate }: ArticleDetailProps) {
  const { currentLanguage, translateContent } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticleDetail();
  }, [articleSlug, currentLanguage]);

  const fetchArticleDetail = async () => {
    try {
      setLoading(true);
      let { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', articleSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (!articleData) {
        const { data: articleById, error: idError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleSlug)
          .eq('is_published', true)
          .maybeSingle();

        articleData = articleById;
        articleError = idError;
      }

      if (articleError) throw articleError;

      if (articleData) {
        const translated = await translateContent(articleData, ['title', 'content', 'author', 'category']);
        setArticle(translated);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <button
              onClick={() => onNavigate('/articles')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="bg-white">
        <button
          onClick={() => onNavigate('/articles')}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
        >
          <ArrowLeft size={20} />
          Back to Articles
        </button>

        <div className="relative h-96 bg-gradient-to-br from-primary-100 to-primary-100">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="text-primary-300" size={120} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4 capitalize">
              {article.category}
            </span>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{article.title}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              <span className="flex items-center gap-2">
                <User size={18} />
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={18} />
                {formatDate(article.published_at)}
              </span>
            </div>
          </div>

          <div className="border-t border-b border-gray-200 py-8 mb-12">
            {article.content ? (
              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <p className="text-gray-600 text-lg">No content available.</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 flex items-center gap-6">
            <div className="flex-shrink-0">
              {article.author_image ? (
                <img
                  src={article.author_image}
                  alt={article.author}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center border-4 border-white shadow-md">
                  <User className="text-white" size={36} />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Written by</p>
              <h3 className="text-2xl font-bold text-gray-900">{article.author}</h3>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
