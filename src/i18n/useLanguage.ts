import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, LANGUAGES } from './config';

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    const nextLang: Language = currentLanguage === 'en' ? 'zh' : 'en';
    setLanguage(nextLang);
  }, [currentLanguage, setLanguage]);

  return {
    t,
    currentLanguage,
    setLanguage,
    toggleLanguage,
    languages: LANGUAGES,
  };
}
