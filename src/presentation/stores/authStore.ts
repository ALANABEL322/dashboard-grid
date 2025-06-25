import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../../domain/entities/User";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user: User, token: string) => {
        set({ user, token, error: null });
      },

      clearUser: () => {
        set({ user: null, token: null, error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      // Manejar la deserialización de fechas
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          // Convertir las fechas de strings a Date objects si es necesario
          if (typeof state.user.createdAt === "string") {
            state.user.createdAt = new Date(state.user.createdAt);
          }
          if (typeof state.user.updatedAt === "string") {
            state.user.updatedAt = new Date(state.user.updatedAt);
          }
        }
      },
    }
  )
);
