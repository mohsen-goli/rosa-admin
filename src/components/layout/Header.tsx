import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../features/auth/authStore";
import { useThemeStore } from "../../features/theme/themeStore";
import { useLanguageStore } from "../../features/language/languageStore";
import type { Language } from "../../features/language/languageStore";

const pageTitleKeys: Record<string, string> = {
  "/": "nav.dashboard",
  "/orders": "nav.orders",
  "/products": "nav.products",
  "/customers": "nav.customers",
  "/settings": "nav.settings",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const titleKey = pageTitleKeys[location.pathname] ?? "nav.dashboard";
  const title = t(titleKey);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const newLang: Language = language === "en" ? "fa" : "en";
    setLanguage(newLang);
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("auth.welcomeBackUser", { email: user?.email ?? "User" })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium"
          title={t("common.language")}
        >
          <Languages size={18} />
          <span className="hidden sm:inline">
            {language === "en" ? "FA" : "EN"}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={t("common.toggleTheme")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2"
          title={t("auth.logout")}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{t("auth.logout")}</span>
        </button>

        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold">
          {user?.email?.[0].toUpperCase() ?? "M"}
        </div>
      </div>
    </header>
  );
}
