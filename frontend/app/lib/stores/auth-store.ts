import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "../types/api-types";

interface AuthStore {
  user: { id: string; email: string } | null;
  accessToken: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;

  setAuth: (
    user: { id: string; email: string },
    accessToken: string,
    profile: UserProfile
  ) => void;
  clearAuth: () => void;
  updateProfile: (profile: UserProfile) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      profile: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, profile) => {
        set({
          user,
          accessToken,
          profile,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          profile: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (profile) => {
        set({ profile });
      },
    }),
    {
      name: "lineup_auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
