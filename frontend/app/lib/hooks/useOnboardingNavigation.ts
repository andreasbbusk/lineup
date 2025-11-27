"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useCallback } from "react";

export function useOnboardingNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { step: storeStep, goToStep: setStoreStep } = useOnboardingStore();

  // Get current step from URL or fallback to store
  const urlStep = searchParams.get("step");
  const currentStep = urlStep ? parseInt(urlStep, 10) : storeStep;

  const navigateToStep = useCallback(
    (step: number) => {
      const clampedStep = Math.max(0, Math.min(step, 5));
      setStoreStep(clampedStep);
      router.push(`/onboarding?step=${clampedStep}`, { scroll: false });
    },
    [router, setStoreStep]
  );

  const nextStep = useCallback(() => {
    navigateToStep(currentStep + 1);
  }, [currentStep, navigateToStep]);

  const prevStep = useCallback(() => {
    navigateToStep(currentStep - 1);
  }, [currentStep, navigateToStep]);

  const goToStep = useCallback(
    (step: number) => {
      navigateToStep(step);
    },
    [navigateToStep]
  );

  return {
    step: currentStep,
    nextStep,
    prevStep,
    goToStep,
  };
}
