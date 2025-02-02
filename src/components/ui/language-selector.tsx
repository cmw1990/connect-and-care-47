import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = {
    en: "English",
    es: "Español",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    hi: "हिन्दी",
    ar: "العربية",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    pt: "Português",
    ru: "Русский",
    tr: "Türkçe",
    vi: "Tiếng Việt",
    th: "ไทย",
    nl: "Nederlands"
  };

  return (
    <Select
      value={i18n.language}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger className="w-[140px]">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languages).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};