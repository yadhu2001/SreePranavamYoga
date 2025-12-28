import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { translateText, translateObject, translateArray } from '../utils/translationService';

interface Language {
  language_code: string;
  language_name: string;
  native_name: string;
  is_default: boolean;
  display_order: number;
}

interface Translation {
  translation_key: string;
  translation_value: string;
}

interface LanguageContextType {
  currentLanguage: string;
  languages: Language[];
  translations: Record<string, string>;
  setLanguage: (languageCode: string) => void;
  t: (key: string, fallback?: string) => string;
  translate: (text: string) => Promise<string>;
  translateContent: <T extends Record<string, any>>(obj: T, fields: (keyof T)[]) => Promise<T>;
  translateList: <T extends Record<string, any>>(items: T[], fields: (keyof T)[]) => Promise<T[]>;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (currentLanguage) {
      fetchTranslations(currentLanguage);
    }
  }, [currentLanguage]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_settings')
        .select('language_code, language_name, native_name, is_default, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setLanguages(data || []);

      const defaultLang = data?.find(lang => lang.is_default);
      if (defaultLang && !localStorage.getItem('selectedLanguage')) {
        setCurrentLanguage(defaultLang.language_code);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchTranslations = async (languageCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select('translation_key, translation_value')
        .eq('language_code', languageCode);

      if (error) throw error;

      const translationsMap: Record<string, string> = {};
      data?.forEach((t: Translation) => {
        translationsMap[t.translation_key] = t.translation_value;
      });

      setTranslations(translationsMap);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  const translate = async (text: string): Promise<string> => {
    if (currentLanguage === 'en') return text;
    return translateText(text, currentLanguage, 'en');
  };

  const translateContent = async <T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[]
  ): Promise<T> => {
    if (currentLanguage === 'en') return obj;
    return translateObject(obj, fields, currentLanguage, 'en');
  };

  const translateList = async <T extends Record<string, any>>(
    items: T[],
    fields: (keyof T)[]
  ): Promise<T[]> => {
    if (currentLanguage === 'en') return items;
    return translateArray(items, fields, currentLanguage, 'en');
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languages,
        translations,
        setLanguage,
        t,
        translate,
        translateContent,
        translateList,
        loading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
