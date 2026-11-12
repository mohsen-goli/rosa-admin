import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";

export function ResetPassword() {
  const navigate = useNavigate();

  const isRecoverySession = useAuthStore((state) => state.isRecoverySession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const clearRecoverySession = useAuthStore(
    (state) => state.clearRecoverySession,
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isRecoverySession && !success) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      clearRecoverySession();
    } catch (err) {
      console.error("Password update failed:", err);
      setError(
        "Unable to update password. Your recovery link may have expired. Please request a new one.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 mb-6">
          <Lock className="text-pink-400" size={22} />
        </div>

        <h1 className="text-2xl font-bold text-white">
          {success ? "Password updated!" : "Create a new password"}
        </h1>

        <p className="text-slate-400 mt-2 text-sm">
          {success
            ? "Your ROSA Admin password has been changed successfully."
            : "Choose a new password for your ROSA Admin account."}
        </p>

        {success ? (
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="w-full mt-8 bg-pink-500 hover:bg-pink-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Continue to Dashboard
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                New password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 pr-11 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Confirm new password
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
