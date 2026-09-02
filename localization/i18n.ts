const FILE_PATH = 'localization/i18n.ts';
import React, { createContext, useContext, useMemo } from 'react';
import { en } from './locales/en.ts';

// For now, only English is supported.
const translations = {
  en: en,
};

type Language = keyof typeof translations;

// Helper to get nested property value
const getNestedValue = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const t = (lang: Language, key: string, ...args: (string | number)[]): string => {
    let translation = getNestedValue(translations[lang], key);

    if (translation === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key as a fallback
    }
    
    if (args.length > 0) {
        args.forEach((arg, index) => {
            const placeholder = new RegExp(`\\{${index}\\}`, 'g');
            translation = translation!.replace(placeholder, String(arg));
        });
    }

    return translation as string;
};

interface LocalizationContextType {
  t: (key: string, ...args: (string | number)[]) => string;
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentLanguage: Language = 'en'; // Hardcoded for now

  const translate = useMemo(() => {
      return (key: string, ...args: (string | number)[]) => t(currentLanguage, key, ...args);
  }, [currentLanguage]);

  const value = { t: translate };

  return React.createElement(LocalizationContext.Provider, { value }, children);
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};