import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import all language resources
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationZHCN from './locales/zh-CN/translation.json';
import translationZHTW from './locales/zh-TW/translation.json';
import translationHI from './locales/hi/translation.json';
import translationAR from './locales/ar/translation.json';
import translationFR from './locales/fr/translation.json';
import translationDE from './locales/de/translation.json';
import translationIT from './locales/it/translation.json';
import translationJA from './locales/ja/translation.json';
import translationKO from './locales/ko/translation.json';
import translationPT from './locales/pt/translation.json';
import translationRU from './locales/ru/translation.json';
import translationTR from './locales/tr/translation.json';
import translationVI from './locales/vi/translation.json';
import translationTH from './locales/th/translation.json';

export const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  'zh-CN': {
    translation: translationZHCN,
  },
  'zh-TW': {
    translation: translationZHTW,
  },
  hi: {
    translation: translationHI,
  },
  ar: {
    translation: translationAR,
  },
  fr: {
    translation: translationFR,
  },
  de: {
    translation: translationDE,
  },
  it: {
    translation: translationIT,
  },
  ja: {
    translation: translationJA,
  },
  ko: {
    translation: translationKO,
  },
  pt: {
    translation: translationPT,
  },
  ru: {
    translation: translationRU,
  },
  tr: {
    translation: translationTR,
  },
  vi: {
    translation: translationVI,
  },
  th: {
    translation: translationTH,
  },
} as const;

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr' },
];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
