
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Default translations
const resources = {
  en: {
    translation: {
      careAssistant: 'Care Assistant',
      askAboutCare: 'Ask about care...',
      getInsights: 'Insights',
      getAIInsights: 'Get AI insights based on conversation'
    }
  },
  es: {
    translation: {
      careAssistant: 'Asistente de Cuidado',
      askAboutCare: 'Preguntar sobre cuidado...',
      getInsights: 'Perspectivas',
      getAIInsights: 'Obtener perspectivas de IA basadas en la conversación'
    }
  },
  fr: {
    translation: {
      careAssistant: 'Assistant de Soins',
      askAboutCare: 'Demander à propos des soins...',
      getInsights: 'Aperçus',
      getAIInsights: 'Obtenir des aperçus IA basés sur la conversation'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
