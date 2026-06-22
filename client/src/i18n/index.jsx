import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './en.js';
import es from './es.js';
import hi from './hi.js';
import ar from './ar.js';

const TRANSLATIONS = { en, es, hi, ar };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('sportscaster-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('sportscaster-lang') || 'en';
      return TRANSLATIONS[saved] || TRANSLATIONS.en;
    } catch {
      return TRANSLATIONS.en;
    }
  });

  const setLanguage = useCallback((lang) => {
    if (!TRANSLATIONS[lang]) return;
    setLanguageState(lang);
    setMessages(TRANSLATIONS[lang]);
    try {
      localStorage.setItem('sportscaster-lang', lang);
    } catch {}
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, []);

  const addTranslation = useCallback((lang, newMessages) => {
    TRANSLATIONS[lang] = { ...(TRANSLATIONS[lang] || {}), ...newMessages };
    if (lang === language) {
      setMessages(TRANSLATIONS[lang]);
    }
  }, [language]);

  const t = useCallback((key) => {
    return messages[key] || key;
  }, [messages]);

  const getLanguage = useCallback(() => language, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <I18nContext.Provider value={{ t, setLanguage, getLanguage, addTranslation, language }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];
