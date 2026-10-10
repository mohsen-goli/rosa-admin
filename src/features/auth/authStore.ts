import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const VALID_EMAIL = "admin@rosa.com";
const VALID_PASSWORD = "rosa123";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: (email, password) => {
        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
          set({ isAuthenticated: true, user: { email } });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: "rosa-auth" },
  ),
);
