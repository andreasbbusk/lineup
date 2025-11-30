// frontend/app/components/onboarding-auth/onboarding-wrapper.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OnboardingBasicInfoForm,
  OnboardingConceptSlider,
  OnboardingLookingFor,
  OnboardingProgress,
  OnboardingSignupStep,
  OnboardingSplash,
  OnboardingUserType,
} from "@/app/components/onboarding-auth";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { useAppStore } from "@/app/lib/stores/app-store";

const STEP_COMPONENTS = {
  0: OnboardingSplash,
  1: OnboardingConceptSlider,
  2: OnboardingSignupStep,
  3: OnboardingUserType,
  4: OnboardingBasicInfoForm,
  5: OnboardingLookingFor,
} as const;

const STEPS_WITH_PROGRESS = [2, 3, 4, 5];
const MIN_STEP = 0;
const MAX_STEP = 5;

export function OnboardingWrapper() {
  const router = useRouter();
  const { step } = useOnboardingNavigation();
  const { onboarding, profile } = useAppStore();

  // Redirect completed users away from onboarding
  useEffect(() => {
    if (profile?.onboarding_completed) {
      router.replace("/");
    }
  }, [profile, router]);

  // Sync URL with store on mount if URL param is missing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("step")) {
      router.replace(`/onboarding?step=${onboarding.step}`, { scroll: false });
    }
  }, [router, onboarding.step]);

  // Redirect invalid steps to start
  useEffect(() => {
    if (step < MIN_STEP || step > MAX_STEP) {
      router.replace("/onboarding?step=0");
    }
  }, [step, router]);

  const Component = STEP_COMPONENTS[step as keyof typeof STEP_COMPONENTS];

  if (!Component) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-grey">Loading...</p>
      </div>
    );
  }

  if (step === 0 || step === 1) {
    return <Component />;
  }

  const showProgress = STEPS_WITH_PROGRESS.includes(step);

  return (
    <main className="min-h-screen bg-white">
      {showProgress && <OnboardingProgress />}
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col items-center justify-center px-6 py-8">
        <Component />
      </div>
    </main>
  );
}
