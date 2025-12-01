import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// Import types from your features (Single Source of Truth)
import { UserProfile } from "@/app/lib/features/profiles";
import { OnboardingData } from "@/app/lib/features/profiles/types"; 

interface AppState {
  // --- AUTH STATE ---
  user: { id: string; email: string } | null;
  access_token: string | null;
  // Use the shared UserProfile type!
  profile: UserProfile | null;
  is_authenticated: boolean;

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
  set_auth: (
    user: { id: string; email: string },
    access_token: string,
    profile: UserProfile | null
  ) => void;
  clear_auth: () => void;
  update_profile: (profile: UserProfile) => void;

  // Onboarding actions
  next_step: () => void;
  prev_step: () => void;
  go_to_step: (step: number) => void;
  update_onboarding_data: (partial: Partial<OnboardingData>) => void;
  reset_onboarding: () => void;
  mark_account_created: () => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // --- INITIAL STATE ---
      user: null,
      access_token: null,
      profile: null,
      is_authenticated: false,

      onboarding: {
        step: 0,
        data: { user_type: "musician", looking_for: [] }, // Type-safe defaults
      },

      // --- ACTIONS ---
      set_auth: (user, access_token, profile) => {
        set({ user, access_token, profile, is_authenticated: true });
      },

      clear_auth: () => {
        set({
          user: null,
          access_token: null,
          profile: null,
          is_authenticated: false,
        });
      },

      update_profile: (profile) => {
        // Shallow merge to ensure we don't overwrite with nulls if partial
        set((state) => ({
            profile: state.profile ? { ...state.profile, ...profile } : profile
        }));
      },

      next_step: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            step: Math.min(state.onboarding.step + 1, 5),
          },
        })),

      prev_step: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            step: Math.max(state.onboarding.step - 1, 0),
          },
        })),

      go_to_step: (step) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            step: Math.max(0, Math.min(step, 5)),
          },
        })),

      update_onboarding_data: (partial) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            data: { ...state.onboarding.data, ...partial },
          },
        })),

      reset_onboarding: () =>
        set({
          onboarding: {
            step: 0,
            data: { user_type: "musician", looking_for: [] },
          },
        }),

      mark_account_created: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            data: { ...state.onboarding.data, account_created: true },
          },
        })),
    }),
    {
      name: "lineup_app_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      // OPTIONAL: Only persist specific fields to avoid storing garbage
      // partialize: (state) => ({ 
      //   user: state.user, 
      //   access_token: state.access_token, 
      //   profile: state.profile 
      // }),
    }
  )
);
