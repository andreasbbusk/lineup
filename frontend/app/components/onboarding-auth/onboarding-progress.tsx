"use client";

import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";

export function OnboardingProgress() {
  const { step } = useOnboardingNavigation();

  // Calculate progress percentage (steps 2-5 = 4 total steps)
  const totalSteps = 4;
  const currentStep = Math.max(0, step - 1); // steps start at 2, so subtract 1
  const progress = Math.min(100, (currentStep / totalSteps) * 100);

  return (
    <div className="fixed left-0 top-8 z-50 w-full bg-white px-6 pb-4 pt-6">
      <div className="relative h-1.5 w-full rounded-[25px] bg-melting-glacier">
        <div
          className="h-full rounded-[25px] bg-crocus-yellow transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
