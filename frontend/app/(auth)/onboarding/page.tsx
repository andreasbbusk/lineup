"use client";

import { useOnboardingNavigation } from "@/app/modules/features/profiles/hooks/onboarding/useOnboardingNavigation";
import { OnboardingSignupStep } from "@/app/modules/features/profiles/components/onboarding/signup";
import { OnboardingUserTypeStep } from "@/app/modules/features/profiles/components/onboarding/user-type";
import { OnboardingProfileInfoStep } from "@/app/modules/features/profiles/components/onboarding/profile-info";
import { OnboardingLookingForStep } from "@/app/modules/features/profiles/components/onboarding/looking-for";
import { OnboardingSplash } from "@/app/modules/features/profiles/components/onboarding/splash-screen";
import { OnboardingConceptSlider } from "@/app/modules/features/profiles/components/onboarding/concept-slider";
import { OnboardingProgress } from "@/app/modules/features/profiles/components/onboarding/progress-bar";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

const STEP_COMPONENTS = {
  0: OnboardingSplash,
  1: OnboardingConceptSlider,
  2: OnboardingSignupStep,
  3: OnboardingUserTypeStep,
  4: OnboardingProfileInfoStep,
  5: OnboardingLookingForStep,
} as const;

const STEPS_WITH_PROGRESS = [2, 3, 4, 5];

export default function OnboardingPage() {
  const { step } = useOnboardingNavigation();

  const Component = STEP_COMPONENTS[step as keyof typeof STEP_COMPONENTS];

  // Show loading state if component is undefined (during redirects/transitions)
  if (!Component) {
    return <LoadingSpinner variant="rays" />;
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
