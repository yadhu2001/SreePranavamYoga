import { useEffect, useMemo, useState } from 'react';
import {
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
  Circle,
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
  Circle,
};

interface Hero {
  id?: string;

  // ✅ DESKTOP (3 sections)
  title: string;
  middle_text: string; // can be plain text OR quill html
  subtitle: string; // can be plain text OR quill html

  // ✅ MOBILE overrides (optional)
  mobile_title?: string | null;
  mobile_middle_text?: string | null;
  mobile_subtitle?: string | null;

  background_image: string;
  background_video?: string;
  cta_text?: string;
  cta_url?: string;

  // ✅ DESKTOP font sizes (3 sections)
  title_font_size?: number | null;
  middle_font_size?: number | null;
  subtitle_font_size?: number | null;

  // ✅ MOBILE font sizes (optional)
  mobile_title_font_size?: number | null;
  mobile_middle_font_size?: number | null;
  mobile_subtitle_font_size?: number | null;
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

function useIsDesktop(breakpointPx = 640) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [breakpointPx]);

  return isDesktop;
}

/**
 * CSS clamp-based font size:
 * - Desktop: close to DB px
 * - Mobile: downscaled more to prevent clipping
 */
function fontClamp(basePx: number, kind: 'title' | 'middle' | 'subtitle', isMobile: boolean) {
  const safe = basePx;

  const mobileScale = kind === 'title' ? 0.42 : kind === 'middle' ? 0.60 : 0.58;

  const minPx = Math.round(safe * (isMobile ? mobileScale : 0.78));
  const maxPx = Math.round(safe);

  const vw =
    kind === 'title'
      ? isMobile
        ? 5.0
        : 3.2
      : kind === 'middle'
      ? isMobile
        ? 2.4
        : 1.4
      : isMobile
      ? 2.0
      : 1.2;

  const add =
    kind === 'title'
      ? Math.round(safe * 0.12)
      : kind === 'middle'
      ? Math.round(safe * 0.18)
      : Math.round(safe * 0.2);

  return `clamp(${minPx}px, ${add}px + ${vw}vw, ${maxPx}px)`;
}

/**
 * If value looks like HTML (contains tags), render as HTML.
 * Else render as plain text inside a <span>.
 */
function HtmlOrText({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const v = (value ?? '').trim();
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(v);

  if (!v) return null;

  if (looksLikeHtml) {
    return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: v }} />;
  }

  return (
    <div className={className} style={style}>
      {v}
    </div>
  );
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const { currentLanguage, translateContent, translateList } = useLanguage();

  const [hero, setHero] = useState<Hero | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [settings, setSettings] = useState<PageSettings>({});
  const [loading, setLoading] = useState(true);

  const isDesktop = useIsDesktop(640);

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

      supabase.from('solutions').select('*').eq('is_active', true).order('sort_order', { ascending: true }),

      supabase.from('page_settings').select('key, value').eq('page', 'hero'),
    ]);

    if (heroData.data) {
      const translatedPart = await translateContent(heroData.data, [
        'title',
        'middle_text',
        'subtitle',
        'cta_text',
        'mobile_title',
        'mobile_middle_text',
        'mobile_subtitle',
      ]);

      const mergedHero: Hero = { ...(heroData.data as Hero), ...(translatedPart as Partial<Hero>) };
      setHero(mergedHero);
    } else {
      setHero(null);
    }

    if (solutionsData.data) {
      const translated = await translateList(solutionsData.data, ['title']);
      setSolutions(translated as Solution[]);
    } else {
      setSolutions([]);
    }

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

  const computed = useMemo(() => {
    if (!hero) {
      return {
        hasDynamicSizes: false,
        desktop: { title: undefined, middle: undefined, subtitle: undefined },
        mobile: { title: undefined, middle: undefined, subtitle: undefined },
      };
    }

    const dt = hero.title_font_size;
    const dm = hero.middle_font_size;
    const ds = hero.subtitle_font_size;

    const desktopOk = typeof dt === 'number' && typeof dm === 'number' && typeof ds === 'number';

    const mt = hero.mobile_title_font_size;
    const mm = hero.mobile_middle_font_size;
    const ms = hero.mobile_subtitle_font_size;

    const mobileOk = typeof mt === 'number' && typeof mm === 'number' && typeof ms === 'number';

    if (!desktopOk && !mobileOk) {
      return {
        hasDynamicSizes: false,
        desktop: { title: undefined, middle: undefined, subtitle: undefined },
        mobile: { title: undefined, middle: undefined, subtitle: undefined },
      };
    }

    const safeDesktopTitle = desktopOk ? clamp(dt!, 14, 140) : null;
    const safeDesktopMiddle = desktopOk ? clamp(dm!, 10, 120) : null;
    const safeDesktopSub = desktopOk ? clamp(ds!, 10, 120) : null;

    const safeMobileTitle = mobileOk ? clamp(mt!, 12, 120) : safeDesktopTitle;
    const safeMobileMiddle = mobileOk ? clamp(mm!, 10, 100) : safeDesktopMiddle;
    const safeMobileSub = mobileOk ? clamp(ms!, 10, 110) : safeDesktopSub;

    const baseCommon: React.CSSProperties = {
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
      hyphens: 'auto',
    };

    return {
      hasDynamicSizes: true,
      desktop: {
        title:
          safeDesktopTitle == null
            ? undefined
            : ({
                ...baseCommon,
                fontSize: fontClamp(safeDesktopTitle, 'title', false),
                lineHeight: 1.06,
              } as React.CSSProperties),

        middle:
          safeDesktopMiddle == null
            ? undefined
            : ({
                ...baseCommon,
                fontSize: fontClamp(safeDesktopMiddle, 'middle', false),
                lineHeight: 1.18,
              } as React.CSSProperties),

        subtitle:
          safeDesktopSub == null
            ? undefined
            : ({
                ...baseCommon,
                fontSize: fontClamp(safeDesktopSub, 'subtitle', false),
                lineHeight: 1.35,
              } as React.CSSProperties),
      },
      mobile: {
        title:
          safeMobileTitle == null
            ? undefined
            : ({
                ...baseCommon,
                fontSize: fontClamp(safeMobileTitle, 'title', true),
                lineHeight: 1.06,
                maxWidth: '92vw',
                marginInline: 'auto',
              } as React.CSSProperties),

        middle:
          safeMobileMiddle == null
            ? undefined
            : ({
                ...baseCommon,
                fontSize: fontClamp(safeMobileMiddle, 'middle', true),
                lineHeight: 1.2,
                maxWidth: '92vw',
                marginInline: 'auto',
              } as React.CSSProperties),

        subtitle:
          safeMobileSub == null
            ? undefined
            : ({
                ...baseCommon,
                fontSize: fontClamp(safeMobileSub, 'subtitle', true),
                lineHeight: 1.35,
                maxWidth: '92vw',
                marginInline: 'auto',
              } as React.CSSProperties),
      },
    };
  }, [hero]);

  if (loading) {
    return (
      <div className="relative min-h-[520px] sm:min-h-[600px] flex items-center justify-center bg-black/10">
        <div className="text-white/80">Loading...</div>
      </div>
    );
  }

  if (!hero) return null;

  // ✅ mobile override fallback
  const mobileTitle = hero.mobile_title?.trim() ? hero.mobile_title : hero.title;
  const mobileMiddle = hero.mobile_middle_text?.trim() ? hero.mobile_middle_text : hero.middle_text;
  const mobileSubtitle = hero.mobile_subtitle?.trim() ? hero.mobile_subtitle : hero.subtitle;

  const desktopTitle = hero.title;
  const desktopMiddle = hero.middle_text;
  const desktopSubtitle = hero.subtitle;

  const loopSolutions = isDesktop ? [...solutions, ...solutions] : solutions;

  return (
    <div className="relative min-h-[520px] sm:min-h-[600px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {hero.background_video ? (
          <video className="w-full h-full object-cover" src={hero.background_video} autoPlay loop muted playsInline />
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero.background_image})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      </div>

      {/* ✅ MOBILE */}
      <div className="relative z-10 sm:hidden px-4 pt-14 pb-10 text-center">
        <h1 className="font-bold text-white mb-2 animate-fade-in" style={computed.mobile.title}>
          {mobileTitle}
        </h1>

        {mobileMiddle?.trim() && (
          <HtmlOrText
            value={mobileMiddle}
            className="text-white/95 mb-2 animate-fade-in-delay"
            style={computed.mobile.middle}
          />
        )}

        <HtmlOrText
          value={mobileSubtitle}
          className="text-white/90 mb-7 mx-auto animate-fade-in-delay"
          style={computed.mobile.subtitle}
        />

        {hero.cta_text && hero.cta_url && (
          <div className="flex justify-center animate-fade-in-delay-2">
            <button
              onClick={handleCtaClick}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition text-sm font-semibold shadow-lg"
            >
              {hero.cta_text}
            </button>
          </div>
        )}

        {solutions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">{getSetting('solutions_heading', 'Solutions Offered...')}</h3>

            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-3 w-max">
                {solutions.map((solution) => {
                  const IconComponent = getIconComponent(solution.icon);
                  return (
                    <div
                      key={solution.id}
                      onClick={() => handleSolutionClick(solution.slug)}
                      className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex flex-col items-center justify-center
                                 gap-1 hover:bg-white/20 transition cursor-pointer border border-white/20"
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                      <span className="text-white text-[10px] font-medium text-center px-2 leading-tight">{solution.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ DESKTOP */}
      <div className="relative z-10 hidden sm:flex min-h-[600px] items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
          <h1
            className={computed.hasDynamicSizes ? 'font-bold text-white mb-3 animate-fade-in' : 'text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in'}
            style={computed.desktop.title}
          >
            {desktopTitle}
          </h1>

          {desktopMiddle?.trim() && (
            <HtmlOrText
              value={desktopMiddle}
              className="text-white/95 mb-2 animate-fade-in-delay"
              style={computed.desktop.middle}
            />
          )}

          <HtmlOrText
            value={desktopSubtitle}
            className="text-white/90 mb-10 sm:mb-12 max-w-3xl mx-auto animate-fade-in-delay"
            style={computed.desktop.subtitle}
          />

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
                <div className="flex gap-4 animate-scroll-slow">
                  {loopSolutions.map((solution, index) => {
                    const IconComponent = getIconComponent(solution.icon);
                    return (
                      <div
                        key={`${solution.id}-${index}`}
                        onClick={() => handleSolutionClick(solution.slug)}
                        className="flex-shrink-0 w-28 h-28 lg:w-32 lg:h-32 bg-white/10 backdrop-blur-sm rounded-full
                                   flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all
                                   duration-300 cursor-pointer group border border-white/20"
                      >
                        <IconComponent className="w-7 h-7 lg:w-8 lg:h-8 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white text-xs lg:text-sm font-medium text-center px-2 leading-tight">{solution.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
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
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-delay { animation: fade-in 1s ease-out 0.2s backwards; }
        .animate-fade-in-delay-2 { animation: fade-in 1s ease-out 0.4s backwards; }
        .animate-scroll-slow { animation: scroll-slow 30s linear infinite; }
        .animate-scroll-slow:hover { animation-play-state: paused; }

        /* ✅ makes quill content look correct inside hero */
        .quill-content p { margin: 0.35em 0; }
        .quill-content strong { font-weight: 700; }
      `}</style>
    </div>
  );
}
