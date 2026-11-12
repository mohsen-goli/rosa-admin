import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isRecoverySession: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearRecoverySession: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  isRecoverySession: false,
  user: null,

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  requestPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "https://rosa-admin.vercel.app/reset-password",
    });

    if (error) throw error;
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  clearRecoverySession: () => {
    useAuthStore.setState({ isRecoverySession: false });
  },
}));

let authInitialized = false;
let authCheckId = 0;

async function syncAuth(user: User | null) {
  const checkId = ++authCheckId;

  if (!user) {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });
    return;
  }

  useAuthStore.setState({
    user,
    isAuthenticated: true,
    isAdmin: false,
    isLoading: true,
  });

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    if (checkId !== authCheckId) return;

    useAuthStore.setState({
      user,
      isAuthenticated: true,
      isAdmin: data?.role === "admin",
      isLoading: false,
    });
  } catch (error) {
    console.error("Admin role verification failed:", error);

    if (checkId !== authCheckId) return;

    useAuthStore.setState({
      user,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
    });
  }
}

export function initializeAuth() {
  if (authInitialized) return;

  authInitialized = true;

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      useAuthStore.setState({ isRecoverySession: true });
    }

    if (event === "SIGNED_OUT") {
      useAuthStore.setState({ isRecoverySession: false });
    }

    const user = session?.user ?? null;

    setTimeout(() => {
      void syncAuth(user);
    }, 0);
  });
}
