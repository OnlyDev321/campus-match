import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { en, TranslationDict } from "@/i18n/dictionaries/en";
import { ko } from "@/i18n/dictionaries/ko";
import { vi } from "@/i18n/dictionaries/vi";
import type { SupportedLanguage, LanguageState } from "@/lib/types";

const dictionaries: Record<SupportedLanguage, TranslationDict> = {
  en,
  ko,
  vi,
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      t: en,

      setLanguage: (lang: SupportedLanguage) => {
        set({
          language: lang,
          t: dictionaries[lang] || en,
        });
      },
    }),
    {
      name: "campusmatch_lang_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = dictionaries[state.language] || en;
        }
      },
    }
  )
);

