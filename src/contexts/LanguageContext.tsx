
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { Species } from '@/lib/types';
import { translations, type Language, type Translations } from '@/lib/translations';

// The getTranslations function is now in @/lib/translations.ts so it can be used on the server.

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const storedLang = localStorage.getItem('galapagos-language') as Language | null;
    if (storedLang && ['es', 'en'].includes(storedLang)) {
      setLanguage(storedLang);
      document.documentElement.lang = storedLang;
    } else {
      document.documentElement.lang = 'es';
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('galapagos-language', lang);
    document.documentElement.lang = lang;
  };
  
  const t = useMemo(() => translations[language], [language]);

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
