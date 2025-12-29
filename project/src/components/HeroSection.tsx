import { useEffect, useMemo, useState } from 'react';
import {
  Brain, Moon, Heart, Flame, CloudRain, Users,
  Activity, Sparkles, Zap, HeartHandshake, Shield,
  Circle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const iconMap: Record<string, any> = {
  Brain,
  Moon,
  Heart,
  Flame,
  CloudRain,
  Users,
  Activity,
  Sparkles,
  Zap,
  HeartHandshake,
  Shield,
  Circle
};

interface Hero {
  id?: string;
  title: string;
  subtitle: string;
  background_image: string;
  background_video?: string;
  cta_text?: string;
  cta_url?: string;

  // ✅ must come from DB (admin saves these)
  title_font_size?: number | null;
  subtitle_font_size?: number | null;
  subtitle_same_as_title?: boolean | null;
}

interface Solution {
  id: string;
  title: string;
  icon: string;
  slug: string;
}

interface PageSettings {
  [key: string]: string;
}

interface HeroSectionProps {
  onNavigate?: (path: string) => void;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function getScale(w: number) {
  if (w < 640) return 0.72;   // mobile
  if (w < 1024) return 0.88;  // tablet
  return 1;                   // desktop
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const { currentLanguage, translateContent, translateList } = useLanguage();
  const [hero, setHero] = useState<Hero | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [settings, setSettings] = useState<PageSettings>({});
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(getScale(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const loadData = async () => {
    setLoading(true);

    const [heroData, solutionsData, settingsData] = await Promise.all([
      supabase
        .from('hero_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('solutions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      supabase
        .from('page_settings')
        .select('key, value')
        .eq('page', 'hero'),
    ]);

    // ✅ HERO (merge translated fields so font-size fields are NOT lost)
    if (heroData.data) {
      const translatedPart = await translateContent(heroData.data, ['title', 'subtitle', 'cta_text']);

      // IMPORTANT: keep ALL DB fields (font sizes included)
      const mergedHero: Hero = {
        ...(heroData.data as Hero),
        ...(translatedPart as Partial<Hero>),
      };

      setHero(mergedHero);
    } else {
      setHero(null);
    }

    // ✅ SOLUTIONS
    if (solutionsData.data) {
      const translated = await translateList(solutionsData.data, ['title']);
      setSolutions(translated as Solution[]);
    } else {
      setSolutions([]);
    }

    // ✅ SETTINGS
    if (settingsData.data) {
      const settingsMap = settingsData.data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as PageSettings);
      setSettings(settingsMap);
    } else {
      setSettings({});
    }

    setLoading(false);
  };

  const getSetting = (key: string, defaultValue: string = '') => settings[key] || defaultValue;
  const getIconComponent = (iconName: string) => iconMap[iconName] || Circle;

  const handleSolutionClick = (slug: string) => {
    if (onNavigate) onNavigate(`/solutions/${slug}`);
  };

  const handleCtaClick = () => {
    if (!hero?.cta_url) return;
    if (onNavigate) onNavigate(hero.cta_url);
    else window.location.href = hero.cta_url;
  };

  // ✅ calculate dynamic sizes from DB (responsive)
  const { titlePx, subtitlePx, hasDynamicSizes } = useMemo(() => {
    if (!hero) return { titlePx: null as number | null, subtitlePx: null as number | null, hasDynamicSizes: false };

    const t = hero.title_font_size;
    const same = hero.subtitle_same_as_title;
    const s = same ? t : hero.subtitle_font_size;

    const ok = typeof t === 'number' && typeof same === 'boolean' && typeof s === 'number';

    if (!ok) {
      // If these are missing, hero still renders using Tailwind fallback classes (NOT blank)
      console.warn('Hero font sizes missing from DB for this row:', {
        id: hero.id,
        title_font_size: hero.title_font_size,
        subtitle_font_size: hero.subtitle_font_size,
        subtitle_same_as_title: hero.subtitle_same_as_title,
      });
      return { titlePx: null, subtitlePx: null, hasDynamicSizes: false };
    }

    const safeTitle = clamp(t!, 14, 140);
    const safeSub = clamp(s!, 12, 120);

    return {
      titlePx: Math.round(safeTitle * scale),
      subtitlePx: Math.round(safeSub * scale),
      hasDynamicSizes: true,
    };
  }, [hero, scale]);

  // ✅ don’t show blank while loading
  if (loading) {
    return (
      <div className="relative min-h-[520px] sm:min-h-[600px] flex items-center justify-center bg-black/10">
        <div className="text-white/80">Loading...</div>
      </div>
    );
  }

  if (!hero) return null;

  return (
    <div className="relative min-h-[520px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {hero.background_video ? (
          <video
            className="w-full h-full object-cover"
            src={hero.background_video}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero.background_image})` }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 sm:py-20 text-center">
        {/* Title */}
        <h1
          className={
            hasDynamicSizes
              ? 'font-bold text-white mb-5 sm:mb-6 animate-fade-in leading-tight'
              : 'text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in'
          }
          style={
            hasDynamicSizes
              ? { fontSize: `${titlePx}px`, lineHeight: 1.08, wordBreak: 'break-word' }
              : undefined
          }
        >
          {hero.title}
        </h1>

        {/* Subtitle */}
        <div className="text-white/90 mb-10 sm:mb-12 max-w-3xl mx-auto animate-fade-in-delay">
          <div
            className="ql-editor quill-content"
            style={
              hasDynamicSizes
                ? { fontSize: `${subtitlePx}px`, lineHeight: 1.45, wordBreak: 'break-word' }
                : undefined
            }
            dangerouslySetInnerHTML={{ __html: hero.subtitle }}
          />
        </div>

        {/* CTA */}
        {hero.cta_text && hero.cta_url && (
          <div className="flex justify-center animate-fade-in-delay-2">
            <button
              onClick={handleCtaClick}
              className="bg-primary-600 text-white px-7 sm:px-8 py-3 rounded-lg hover:bg-primary-700 transition text-base sm:text-lg font-semibold shadow-lg"
            >
              {hero.cta_text}
            </button>
          </div>
        )}

        {solutions.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8 animate-fade-in-delay-2">
              {getSetting('solutions_heading', 'Solutions Offered...')}
            </h3>

            <div className="relative overflow-hidden">
              <div className="flex gap-3 sm:gap-4 animate-scroll-slow">
                {[...solutions, ...solutions].map((solution, index) => {
                  const IconComponent = getIconComponent(solution.icon);
                  return (
                    <div
                      key={`${solution.id}-${index}`}
                      onClick={() => handleSolutionClick(solution.slug)}
                      className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-sm rounded-full flex flex-col items-center justify-center gap-1 sm:gap-2 hover:bg-white/20 transition-all duration-300 cursor-pointer group border border-white/20"
                    >
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
                      <span className="text-white text-xs sm:text-sm font-medium text-center px-2">
                        {solution.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scroll-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.2s backwards;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.4s backwards;
        }

        .animate-scroll-slow {
          animation: scroll-slow 30s linear infinite;
        }

        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }

        .ql-editor { padding: 0 !important; }
        .ql-editor p { margin: 0.5em 0; }
      `}</style>
    </div>
  );
}
