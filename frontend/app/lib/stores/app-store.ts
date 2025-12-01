import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// Import types from your features (Single Source of Truth)
import { UserProfile } from "@/app/lib/features/profiles";
import { OnboardingData } from "@/app/lib/features/profiles/types";

interface AppState {
  // --- AUTH STATE ---
  user: { id: string; email: string } | null;
  accessToken: string | null;
  // Use the shared UserProfile type!
  profile: UserProfile | null;
  isAuthenticated: boolean;

  // --- ONBOARDING STATE ---
  onboarding: {
    step: number;
    // Use the shared OnboardingData type!
    data: Partial<OnboardingData>;
  };

  // --- FUTURE: GLOBAL UI STATE ---
  // theme: 'light' | 'dark';
  // isSidebarOpen: boolean;
}

interface AppActions {
  // Auth actions
  setAuth: (
    user: { id: string; email: string },
    accessToken: string,
    profile: UserProfile | null
  ) => void;
  clearAuth: () => void;
  updateProfile: (profile: UserProfile) => void;

  // Onboarding actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateOnboardingData: (partial: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  markAccountCreated: () => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // --- INITIAL STATE ---
      user: null,
      accessToken: null,
      profile: null,
      isAuthenticated: false,

      onboarding: {
        step: 0,
        data: { userType: "musician", lookingFor: [] }, // Type-safe defaults
      },

      // --- ACTIONS ---
      setAuth: (user, accessToken, profile) => {
        set({ user, accessToken, profile, isAuthenticated: true });
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
        // Shallow merge to ensure we don't overwrite with nulls if partial
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...profile } : profile,
        }));
      },

      nextStep: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            step: Math.min(state.onboarding.step + 1, 5),
          },
        })),

      prevStep: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            step: Math.max(state.onboarding.step - 1, 0),
          },
        })),

      goToStep: (step) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            step: Math.max(0, Math.min(step, 5)),
          },
        })),

      updateOnboardingData: (partial) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            data: { ...state.onboarding.data, ...partial },
          },
        })),

      resetOnboarding: () =>
        set({
          onboarding: {
            step: 0,
            data: { userType: "musician", lookingFor: [] },
          },
        }),

      markAccountCreated: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            data: { ...state.onboarding.data, accountCreated: true },
          },
        })),
    }),
    {
      name: "lineup_app_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      // OPTIONAL: Only persist specific fields to avoid storing garbage
      // partialize: (state) => ({
      //   user: state.user,
      //   accessToken: state.accessToken,
      //   profile: state.profile
      // }),
    }
  )
);
