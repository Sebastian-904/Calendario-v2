import React, { createContext, useState, useContext, useMemo } from 'react';
import { en } from '../i18n/en.ts';
import { es } from '../i18n/es.ts';

type Language = 'en' | 'es';

const translations = { en, es };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested values from object by key path
const getNestedTranslation = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = useMemo(() => (key: string, options?: Record<string, string | number>): string => {
    let text = getNestedTranslation(translations[language], key);
    
    if (text === undefined) {
      // Fallback to English if translation is missing
      text = getNestedTranslation(translations['en'], key);
    }

    if (text === undefined) {
      return key;
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        text = (text as string).replace(`{${optKey}}`, String(options[optKey]));
      });
    }

    return text;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};