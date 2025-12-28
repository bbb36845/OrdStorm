import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../i18n';

const LANGUAGE_FLAGS: Record<Language, { flag: string; label: string }> = {
  da: { flag: '🇩🇰', label: 'Dansk' },
  en: { flag: '🇬🇧', label: 'English' },
};

interface LanguageSelectorProps {
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const handleToggle = () => {
    setLanguage(language === 'da' ? 'en' : 'da');
  };

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-2 glass-card hover:bg-white/90
          text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium btn-premium"
        title={`Switch to ${language === 'da' ? 'English' : 'Dansk'}`}
      >
        <span className="text-lg">{LANGUAGE_FLAGS[language].flag}</span>
        <span className="hidden sm:inline">{LANGUAGE_FLAGS[language].label}</span>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
      {(Object.keys(LANGUAGE_FLAGS) as Language[]).map((lang) => (
        <motion.button
          key={lang}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLanguage(lang)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium
            ${language === lang
              ? 'bg-white shadow-md text-gray-800'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }
          `}
        >
          <span className="text-base">{LANGUAGE_FLAGS[lang].flag}</span>
          <span className="hidden sm:inline">{LANGUAGE_FLAGS[lang].label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSelector;
