import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },
}));

let authInitialized = false;

export function initializeAuth() {
  if (authInitialized) return;

  authInitialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading: false,
    });
  });

  void supabase.auth.getSession().then(({ data, error }) => {
    const user = error ? null : (data.session?.user ?? null);

    useAuthStore.setState({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  });
}
