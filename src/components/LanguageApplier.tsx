import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../features/language/languageStore";

export function LanguageApplier() {
  const language = useLanguageStore((state) => state.language);
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);

    const root = document.documentElement;
    if (language === "fa") {
      root.setAttribute("dir", "rtl");
      root.setAttribute("lang", "fa");
      root.classList.add("font-fa");
    } else {
      root.setAttribute("dir", "ltr");
      root.setAttribute("lang", "en");
      root.classList.remove("font-fa");
    }
  }, [language, i18n]);

  return null;
}
