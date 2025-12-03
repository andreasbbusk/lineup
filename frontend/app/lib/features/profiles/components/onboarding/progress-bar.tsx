"use client";

import { useOnboardingNavigation } from "../../hooks/onboarding/useOnboardingNavigation";

const PROGRESS_START_STEP = 2;
const TOTAL_STEPS_WITH_PROGRESS = 4;

export function OnboardingProgress() {
  const { step } = useOnboardingNavigation();

  const currentProgressStep = Math.max(0, step - PROGRESS_START_STEP);
  const progress = Math.min(
    100,
    (currentProgressStep / TOTAL_STEPS_WITH_PROGRESS) * 100
  );

  return (
    <div className="sticky top-0 z-50 w-full px-6 pb-4 pt-6">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-melting-glacier">
        <div
          className="h-full rounded-full bg-crocus-yellow transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Onboarding progress: ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
}
