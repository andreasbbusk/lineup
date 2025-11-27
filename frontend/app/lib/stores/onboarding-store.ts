import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  userType: "musician" | "service_provider";
  lookingFor: string[];
  accountCreated?: boolean;
}

interface OnboardingStore {
  step: number;
  data: Partial<OnboardingData>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
  markAccountCreated: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 0,
      data: { userType: "musician", lookingFor: [] },
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
      goToStep: (step) => set({ step: Math.max(0, Math.min(step, 5)) }),
      updateData: (partial) =>
        set((s) => ({
          data: { ...s.data, ...partial },
        })),
      reset: () =>
        set({ step: 0, data: { userType: "musician", lookingFor: [] } }),
      markAccountCreated: () =>
        set((s) => ({
          data: { ...s.data, accountCreated: true },
        })),
    }),
    {
      name: "lineup_onboarding_data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data, step: state.step }), // Persist both data and step
    }
  )
);
