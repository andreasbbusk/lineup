"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useMyProfile } from "../../profiles/hooks/queries/useProfile";

export type RedirectStrategy =
  | "guest-only"           // Redirect authenticated users (login, signup pages)
  | "authenticated-only"   // Redirect guests (protected pages)
  | "onboarding";          // Onboarding flow with step-based logic

interface UseAuthRedirectOptions {
  strategy: RedirectStrategy;
  /**
   * Current onboarding step (required when strategy is "onboarding")
   */
  currentStep?: number;
}

interface UseAuthRedirectResult {
  /**
   * Whether the component is still mounting or loading profile data
   */
  isLoading: boolean;

  /**
   * Whether to show the content (false = will redirect)
   */
  shouldShowContent: boolean;
}

/**
 * Centralized authentication redirect logic
 *
 * Handles:
 * - Client-side mount detection
 * - Profile loading states
 * - Redirects based on auth and onboarding status
 *
 * @example
 * // For login page (guest-only)
 * const { isLoading, shouldShowContent } = useAuthRedirect({ strategy: "guest-only" });
 * if (isLoading || !shouldShowContent) return <Loading />;
 * return <LoginForm />;
 *
 * @example
 * // For onboarding flow
 * const { isLoading, shouldShowContent } = useAuthRedirect({
 *   strategy: "onboarding",
 *   currentStep: step
 * });
 */
export function useAuthRedirect(options: UseAuthRedirectOptions): UseAuthRedirectResult {
  const { strategy, currentStep } = options;
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  // Handle redirects
  useEffect(() => {
    if (!isMounted) return;

    // Wait for profile to load if user is authenticated
    if (isAuthenticated && isProfileLoading) return;

    const isOnboardingCompleted = profile?.onboardingCompleted;
    let redirectPath: string | null = null;

    // Determine redirect based on strategy
    switch (strategy) {
      case "guest-only":
        // Redirect authenticated users (e.g., login page)
        if (isAuthenticated) {
          redirectPath = isOnboardingCompleted ? "/" : "/onboarding?step=3";
        }
        break;

      case "authenticated-only":
        // Redirect guests (e.g., protected pages)
        if (!isAuthenticated) {
          redirectPath = "/login";
        } else if (!isOnboardingCompleted) {
          redirectPath = "/onboarding?step=3";
        }
        break;

      case "onboarding":
        // Onboarding flow with step-based logic
        const MIN_STEP = 0;
        const MAX_STEP = 5;
        const step = currentStep ?? 0;

        // SCENARIO: User completed onboarding -> Home
        if (isAuthenticated && isOnboardingCompleted) {
          redirectPath = "/";
          break;
        }

        // SCENARIO: Guest trying to access Auth-only steps (3, 4, 5)
        if (!isAuthenticated && step > 2) {
          redirectPath = "/onboarding?step=2";
          break;
        }

        // SCENARIO: Authenticated user trying to see Splash/Signup (0, 1, 2)
        if (isAuthenticated && step < 3) {
          redirectPath = "/onboarding?step=3";
          break;
        }

        // SCENARIO: Invalid step number
        if (step < MIN_STEP || step > MAX_STEP) {
          const fallback = isAuthenticated ? 3 : 0;
          redirectPath = `/onboarding?step=${fallback}`;
        }
        break;
    }

    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [isMounted, isAuthenticated, profile?.onboardingCompleted, isProfileLoading, router, strategy, currentStep]);

  const isLoading = !isMounted || (isAuthenticated && isProfileLoading);
  const shouldShowContent = !isLoading && !shouldRedirect(strategy, isAuthenticated, profile?.onboardingCompleted, currentStep);

  return {
    isLoading,
    shouldShowContent,
  };
}

/**
 * Helper to determine if we should redirect
 */
function shouldRedirect(
  strategy: RedirectStrategy,
  isAuthenticated: boolean,
  isOnboardingCompleted: boolean | null | undefined,
  currentStep?: number
): boolean {
  const MIN_STEP = 0;
  const MAX_STEP = 5;
  const step = currentStep ?? 0;

  switch (strategy) {
    case "guest-only":
      return isAuthenticated;

    case "authenticated-only":
      return !isAuthenticated || (isAuthenticated && !isOnboardingCompleted);

    case "onboarding":
      // Should redirect if any of these conditions are true
      if (isAuthenticated && isOnboardingCompleted) return true;
      if (!isAuthenticated && step > 2) return true;
      if (isAuthenticated && step < 3) return true;
      if (step < MIN_STEP || step > MAX_STEP) return true;
      return false;

    default:
      return false;
  }
}
