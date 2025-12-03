"use client";

import { useOnboardingNavigation } from "../../hooks/onboarding/useOnboardingNavigation";
import { OnboardingSignupStep } from "./signup";
import { OnboardingUserTypeStep } from "./user-type";
import { OnboardingProfileInfoStep } from "./profile-info";
import { OnboardingLookingForStep } from "./looking-for";
import { OnboardingSplash } from "./splash-screen";
import { OnboardingConceptSlider } from "./concept-slider";
import { OnboardingProgress } from "./progress-bar";

const STEP_COMPONENTS = {
  0: OnboardingSplash,
  1: OnboardingConceptSlider,
  2: OnboardingSignupStep,
  3: OnboardingUserTypeStep,
  4: OnboardingProfileInfoStep,
  5: OnboardingLookingForStep,
} as const;

const STEPS_WITH_PROGRESS = [2, 3, 4, 5];

export function OnboardingWrapper() {
  const { step } = useOnboardingNavigation();

  const Component = STEP_COMPONENTS[step as keyof typeof STEP_COMPONENTS];

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
