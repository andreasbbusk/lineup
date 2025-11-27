"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useCallback } from "react";

export function useOnboardingNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onboarding, goToStep: setStoreStep } = useAppStore();

  // Get current step from URL or fallback to store
  const urlStep = searchParams.get("step");
  const currentStep = urlStep ? parseInt(urlStep, 10) : onboarding.step;

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
