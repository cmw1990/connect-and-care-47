import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './languages/en';
// Import other language files as needed
// We'll add them incrementally to avoid overwhelming the system

const resources = {
  en,
  // Add other languages here
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;