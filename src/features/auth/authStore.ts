
import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
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

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;

    // Run the profile query outside the auth callback.
    setTimeout(() => {
      void syncAuth(user);
    }, 0);
  });
}
