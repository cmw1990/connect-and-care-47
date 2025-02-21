import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/types/supabase';
import { supportedLanguages } from '@/i18n/config';

interface LanguageContextType {
  currentLanguage: string;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  direction: 'ltr',
  setLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  const setLanguage = async (lang: string) => {
    const selectedLang = supportedLanguages.find(l => l.code === lang);
    if (!selectedLang) return;

    // Update i18next language
    await i18n.changeLanguage(lang);

    // Update HTML dir and lang attributes
    document.documentElement.dir = selectedLang.dir;
    document.documentElement.lang = lang;

    // Save preference to Supabase if user is logged in
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          language: lang,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
    }
  };

  // Load user's language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.language) {
          await setLanguage(data.language);
        }
      }
    };

    loadLanguagePreference();
  }, [user]);

  // Get current language direction
  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];
  const direction = currentLang.dir as 'ltr' | 'rtl';

  const value = {
    currentLanguage: i18n.language,
    direction,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
