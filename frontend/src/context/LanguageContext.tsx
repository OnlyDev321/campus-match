"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, TranslationDict } from "@/i18n/dictionaries/en";
import { ko } from "@/i18n/dictionaries/ko";
import { vi } from "@/i18n/dictionaries/vi";
import type { SupportedLanguage } from "@/lib/types";
export type { SupportedLanguage };

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDict;
}

const dictionaries: Record<SupportedLanguage, TranslationDict> = {
  en,
  ko,
  vi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_LANG = "campusmatch_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English as requested
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as SupportedLanguage | null;
      if (savedLang && (savedLang === "en" || savedLang === "ko" || savedLang === "vi")) {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.error("Failed to load language from localStorage", e);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}
  };

  const t = dictionaries[language] || en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
