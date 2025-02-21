import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/providers/LanguageProvider';
import { supportedLanguages } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Languages } from 'lucide-react';

export const LanguageSelector = () => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageChange = async (value: string) => {
    await setLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('common.selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name} ({lang.nativeName})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
