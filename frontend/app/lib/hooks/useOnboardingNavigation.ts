"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useOnboardingNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStep = parseInt(searchParams.get("step") || "0", 10);

  const navigateToStep = useCallback(
    (step: number) => {
      const clampedStep = Math.max(0, Math.min(step, 5));
      router.push(`/onboarding?step=${clampedStep}`, { scroll: false });
    },
    [router]
  );

  const nextStep = useCallback(() => {
    navigateToStep(currentStep + 1);
  }, [currentStep, navigateToStep]);

  const prevStep = useCallback(() => {
    navigateToStep(currentStep - 1);
  }, [currentStep, navigateToStep]);

  return {
    step: currentStep,
    nextStep,
    prevStep,
    goToStep: navigateToStep,
  };
}
