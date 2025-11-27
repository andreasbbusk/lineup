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
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";

export function OnboardingWrapper() {
  const router = useRouter();
  const { step } = useOnboardingNavigation();
  const storeStep = useOnboardingStore((s) => s.step);

  // Initialize URL on first render if missing - only runs once
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("step")) {
      router.replace(`/onboarding?step=${storeStep}`, { scroll: false });
    }
  }, []);

  if (step === 0) {
    return <OnboardingSplash />;
  }

  if (step === 1) {
    return <OnboardingConceptSlider />;
  }

  return (
    <main className="bg-white">
      {step >= 2 && <OnboardingProgress />}
      <div className="mx-auto flex max-w-lg flex-col items-center px-6">
        {step === 2 && <OnboardingSignupStep />}
        {step === 3 && <OnboardingUserType />}
        {step === 4 && <OnboardingBasicInfoForm />}
        {step === 5 && <OnboardingLookingFor />}
      </div>
    </main>
  );
}
