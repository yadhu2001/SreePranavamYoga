import { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function FloatingLanguageSwitcher() {
  const { currentLanguage, languages, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.language_code === currentLanguage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl px-4 py-3 rounded-full transition-all duration-200 border border-gray-200"
        aria-label="Select Language"
      >
        <Globe size={24} className="text-primary-600" />
        <span className="font-medium text-gray-700">
          {currentLang?.native_name || 'English'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <h3 className="font-semibold text-sm">Select Language</h3>
            <p className="text-xs opacity-90 mt-0.5">Choose your preferred language</p>
          </div>

          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.language_code}
                onClick={() => handleLanguageChange(lang.language_code)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentLanguage === lang.language_code
                    ? 'bg-primary-50'
                    : ''
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className={`font-semibold ${
                    currentLanguage === lang.language_code
                      ? 'text-primary-700'
                      : 'text-gray-700'
                  }`}>
                    {lang.native_name}
                  </span>
                  <span className="text-xs text-gray-500">{lang.language_name}</span>
                </div>

                {currentLanguage === lang.language_code && (
                  <Check size={20} className="text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
