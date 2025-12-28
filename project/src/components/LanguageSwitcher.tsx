// import { useState, useEffect, useRef } from 'react';
// import { Globe } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext';

// const normalizeCode = (code: string | null | undefined) => (code || 'en').trim().toLowerCase();

// export default function LanguageSwitcher() {
//   const { currentLanguage, languages, setLanguage } = useLanguage();
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const normalizedCurrent = normalizeCode(currentLanguage);

//   const currentLang = languages.find(
//     (lang) => normalizeCode(lang.language_code) === normalizedCurrent
//   );

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLanguageChange = (langCode: string) => {
//     setLanguage(normalizeCode(langCode));
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
//         aria-label="Select Language"
//       >
//         <Globe size={20} className="text-gray-600" />
//         <span className="text-sm font-medium text-gray-700">
//           {currentLang?.native_name || 'English'}
//         </span>
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//           {languages.map((lang) => {
//             const langCode = normalizeCode(lang.language_code);
//             const selected = langCode === normalizedCurrent;

//             return (
//               <button
//                 key={lang.language_code}
//                 onClick={() => handleLanguageChange(lang.language_code)}
//                 className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
//                   selected ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
//                 }`}
//               >
//                 <div className="flex flex-col">
//                   <span className="font-medium">{lang.native_name}</span>
//                   <span className="text-xs text-gray-500">{lang.language_name}</span>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
