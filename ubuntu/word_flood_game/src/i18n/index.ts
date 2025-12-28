import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import da from './locales/da.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['da', 'en'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

const resources = {
  da: { translation: da },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'da',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'letsword_language',
    },
  });

export default i18n;
