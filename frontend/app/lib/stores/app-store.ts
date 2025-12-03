import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/app/lib/supabase/client";
import { OnboardingData } from "@/app/lib/features/profiles/types";
import { initializeAuthState } from "@/app/lib/features/auth";

interface AppState {
  user: {
    id: string;
    email: string;
    username: string;
    onboardingCompleted: boolean;
  } | null;
  isInitialized: boolean;
  onboarding: {
    step: number;
    data: Partial<OnboardingData>;
  };
}

interface AppActions {
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
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
      isInitialized: false,
      onboarding: {
        step: 0,
        data: {},
      },

      // --- AUTH ACTIONS ---
      initializeAuth: async () => {
        const user = await initializeAuthState();
        set({
          user,
          isInitialized: true,
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isInitialized: true,
          onboarding: { step: 0, data: {} },
        });
      },

      // --- ONBOARDING ACTIONS ---
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

      resetOnboarding: () => {
        set({
          onboarding: {
            step: 0,
            data: {},
          },
        });
        useAppStore.persist.clearStorage();
      },

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
      partialize: (state) => ({
        onboarding: state.onboarding,
      }),
    }
  )
);
