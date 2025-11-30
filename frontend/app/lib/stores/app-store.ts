import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "../types/api-types";

// Onboarding data interface
interface OnboardingData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_country_code: number;
  phone_number: number;
  year_of_birth: number;
  location: string;
  user_type: "musician" | "service_provider" | "other";
  looking_for: string[];
  account_created?: boolean;
}

// Combined store interface
interface AppStore {
  // Auth state
  user: { id: string; email: string } | null;
  access_token: string | null;
  profile: UserProfile | null;
  is_authenticated: boolean;

  // Onboarding state
  onboarding: {
    step: number;
    data: Partial<OnboardingData>;
  };

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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Auth initial state
      user: null,
      access_token: null,
      profile: null,
      is_authenticated: false,

      // Onboarding initial state
      onboarding: {
        step: 0,
        data: { user_type: "musician", looking_for: [] },
      },

      // Auth actions
      set_auth: (user, access_token, profile) => {
        set({
          user,
          access_token,
          profile,
          is_authenticated: true,
        });
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
        set({ profile });
      },

      // Onboarding actions
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
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);

// Backward compatibility exports
export const useAuthStore = useAppStore;
export const useOnboardingStore = () => {
  const store = useAppStore();
  return {
    step: store.onboarding.step,
    data: store.onboarding.data,
    nextStep: store.next_step,
    prevStep: store.prev_step,
    goToStep: store.go_to_step,
    updateData: store.update_onboarding_data,
    reset: store.reset_onboarding,
    markAccountCreated: store.mark_account_created,
  };
};
