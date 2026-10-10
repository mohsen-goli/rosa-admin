import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../../features/auth/authStore";
import { useThemeStore } from "../../features/theme/themeStore";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/products": "Products",
  "/customers": "Customers",
  "/settings": "Settings",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const title = pageTitles[location.pathname] ?? "Rosa Admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Welcome back, {user?.email ?? "User"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>

        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold">
          {user?.email?.[0].toUpperCase() ?? "M"}
        </div>
      </div>
    </header>
  );
}
