import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "../types/api-types";

// Onboarding data interface
interface OnboardingData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  yearOfBirth: number;
  location: string;
  userType: "musician" | "service_provider" | "other";
  lookingFor: string[];
  accountCreated?: boolean;
}

// Combined store interface
interface AppStore {
  // Auth state
  user: { id: string; email: string } | null;
  accessToken: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;

  // Onboarding state
  onboarding: {
    step: number;
    data: Partial<OnboardingData>;
  };

  // Auth actions
  setAuth: (
    user: { id: string; email: string },
    accessToken: string,
    profile: UserProfile
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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Auth initial state
      user: null,
      accessToken: null,
      profile: null,
      isAuthenticated: false,

      // Onboarding initial state
      onboarding: {
        step: 0,
        data: { userType: "musician", lookingFor: [] },
      },

      // Auth actions
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

      // Onboarding actions
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
      storage: createJSONStorage(() => localStorage),
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
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    goToStep: store.goToStep,
    updateData: store.updateOnboardingData,
    reset: store.resetOnboarding,
    markAccountCreated: store.markAccountCreated,
  };
};
