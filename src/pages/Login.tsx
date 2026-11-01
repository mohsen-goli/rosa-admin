import { useState, lazy, Suspense } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../features/auth/authStore";

const AtomScene = lazy(() =>
  import("../features/three/AtomScene").then((m) => ({
    default: m.AtomScene,
  })),
);

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch {
      setError("ایمیل یا رمز عبور اشتباه است.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950">
        <Suspense fallback={<div className="w-full h-full bg-slate-950" />}>
          <AtomScene />
        </Suspense>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-pink-400">Rosa</span> Admin
          </h1>
          <p className="text-slate-300 mt-2 text-sm">
            {t("auth.signInSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="text-pink-400">Rosa</span> Admin
            </h1>
          </div>

          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 mb-6">
            <Lock className="text-pink-400" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-white">Welcome back</h2>

          <p className="text-slate-400 mt-1 text-sm">
            {t("auth.signInSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t("auth.email")}
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t("auth.password")}
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? "Signing in..." : t("auth.signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
