"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboardingNavigation } from "../../hooks/useOnboardingNavigation";
import { useAppStore } from "@/app/lib/stores/app-store";
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
const MIN_STEP = 0;
const MAX_STEP = 5;

export function OnboardingWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { step } = useOnboardingNavigation();
  const { profile, isAuthenticated } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Wait for client-side mount
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  // 2. ACCESS CONTROL & REDIRECT LOGIC
  useEffect(() => {
    if (!isMounted) return;

    // SCENARIO: User is fully done -> Kick to Home
    if (isAuthenticated && profile?.onboardingCompleted) {
      router.replace("/");
      return;
    }

    const urlStep = parseInt(searchParams.get("step") || "0", 10);

    // SCENARIO: Guest trying to access Auth-only steps (3, 4, 5)
    if (!isAuthenticated && urlStep > 2) {
      router.replace("/onboarding?step=2");
      return;
    }

    // SCENARIO: Logged-in user trying to see Splash/Signup (0, 1, 2)
    if (isAuthenticated && urlStep < 3) {
      router.replace("/onboarding?step=3");
      return;
    }

    // SCENARIO: Invalid step number
    if (urlStep < MIN_STEP || urlStep > MAX_STEP) {
      const fallback = isAuthenticated ? 3 : 0;
      router.replace(`/onboarding?step=${fallback}`);
    }

  }, [isMounted, isAuthenticated, profile, router, searchParams]);

  // 3. RENDER GUARDS
  
  // ✅ Return null on server-side and during first client render
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-grey">Loading...</p>
      </div>
    );
  }

  // Don't render if we are about to redirect
  if (isAuthenticated && profile?.onboardingCompleted) return null;

  const Component = STEP_COMPONENTS[step as keyof typeof STEP_COMPONENTS];

  if (!Component) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-grey">Loading...</p>
      </div>
    );
  }

  // 4. LAYOUT RENDER
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
