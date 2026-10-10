import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "fa";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "rosa-language" },
  ),
);
