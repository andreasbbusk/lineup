"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useAppStore } from "@/app/modules/stores/app-store";

export function useOnboardingNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onboarding, goToStep: updateStoreStep } = useAppStore();

  // Get step from URL
  const urlStep = parseInt(searchParams.get("step") || "0", 10);

  // Sync URL step → Store step (single source of truth)
  useEffect(() => {
    if (urlStep !== onboarding.step) {
      updateStoreStep(urlStep);
    }
  }, [urlStep, onboarding.step, updateStoreStep]);

  const navigateToStep = useCallback(
    (step: number) => {
      const clampedStep = Math.max(0, Math.min(step, 5));

      // Update store first
      updateStoreStep(clampedStep);

      // Then update URL
      router.push(`/onboarding?step=${clampedStep}`, { scroll: false });
    },
    [router, updateStoreStep]
  );

  const nextStep = useCallback(() => {
    navigateToStep(onboarding.step + 1);
  }, [onboarding.step, navigateToStep]);

  const prevStep = useCallback(() => {
    navigateToStep(onboarding.step - 1);
  }, [onboarding.step, navigateToStep]);

  return {
    step: onboarding.step, // Return store step (synced with URL)
    nextStep,
    prevStep,
    goToStep: navigateToStep,
  };
}
