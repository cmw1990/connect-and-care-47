import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supportedLanguages } from '@/i18n/config';

export class LanguageService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getSupportedLanguages() {
    const { data, error } = await this.supabase
      .from('supported_languages')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  async getUserLanguagePreference(userId: string) {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.language || 'en';
  }

  async setUserLanguagePreference(userId: string, language: string) {
    // Validate language code
    if (!supportedLanguages.some(lang => lang.code === language)) {
      throw new Error('Unsupported language code');
    }

    const { error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        language,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
  }

  async getLanguageContent(language: string) {
    try {
      const module = await import(`@/i18n/locales/${language}/translation.json`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load language content for ${language}`, error);
      // Fallback to English
      const enModule = await import('@/i18n/locales/en/translation.json');
      return enModule.default;
    }
  }

  getLanguageDirection(language: string): 'ltr' | 'rtl' {
    const lang = supportedLanguages.find(l => l.code === language);
    return lang?.dir as 'ltr' | 'rtl' || 'ltr';
  }

  async subscribeToLanguageUpdates(userId: string, callback: (language: string) => void) {
    return this.supabase
      .channel('language_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && 'language' in payload.new) {
            callback(payload.new.language as string);
          }
        }
      )
      .subscribe();
  }
}
