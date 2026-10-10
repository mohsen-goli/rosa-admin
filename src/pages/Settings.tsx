import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, LogOut, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";
import { useThemeStore } from "../features/theme/themeStore";

type SaveStatus = "idle" | "saving" | "saved";

export function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [displayName, setDisplayName] = useState(
    user?.email?.split("@")[0] ?? "User",
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences.
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full max-w-sm px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Email cannot be changed in demo.
            </p>
          </div>

          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && (
              <>
                <Check size={16} />
                Saved!
              </>
            )}
            {saveStatus === "idle" && "Save Changes"}
          </button>
        </form>
      </section>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Appearance
        </h2>

        <div className="space-y-2">
          <button
            onClick={() => setTheme("light")}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              theme === "light"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun size={18} className="text-slate-700 dark:text-slate-300" />
              <span className="text-sm text-slate-800 dark:text-slate-100">
                Light
              </span>
            </div>
            {theme === "light" && <Check size={16} className="text-pink-500" />}
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              theme === "dark"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-slate-700 dark:text-slate-300" />
              <span className="text-sm text-slate-800 dark:text-slate-100">
                Dark
              </span>
            </div>
            {theme === "dark" && <Check size={16} className="text-pink-500" />}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-500/30 p-6 transition-colors">
        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Sign out from your account. You will need to sign in again.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </section>
    </div>
  );
}
