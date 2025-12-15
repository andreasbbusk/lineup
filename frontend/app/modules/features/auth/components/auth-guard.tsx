"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppStore } from "@/app/modules/stores/Store";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

/**
 * PUBLIC_PATHS: Routes that don't require authentication.
 */
const PUBLIC_PATHS = ["/login"];

/**
 * AuthGuard provides client-side route protection for UX purposes.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use selective subscriptions to prevent unnecessary re-renders
  const isInitialized = useAppStore((state) => state.isInitialized);
  const user = useAppStore((state) => state.user);
  const initializeAuth = useAppStore((state) => state.initializeAuth);

  // Initialize auth on mount - only run once
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Memoize derived auth state to prevent recalculation
  const authState = useMemo(() => ({
    isAuthenticated: !!user,
    onboardingCompleted: user?.onboardingCompleted ?? false,
  }), [user]);

  // Extract step only when on onboarding page to minimize dependencies
  const currentStep = useMemo(() => {
    if (pathname?.startsWith("/onboarding")) {
      return searchParams.get("step");
    }
    return null;
  }, [pathname, searchParams]);

  // Handle redirects with optimized dependencies
  useEffect(() => {
    if (!isInitialized) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const { isAuthenticated, onboardingCompleted } = authState;

    // Public path logic
    if (isPublicPath) {
      // Redirect authenticated users away from login page
      if (pathname === "/login" && isAuthenticated) {
        router.replace(onboardingCompleted ? "/" : "/onboarding?step=3");
        return;
      }
      return;
    }

    // Special case: Onboarding page
    if (pathname?.startsWith("/onboarding")) {
      const stepNum = parseInt(currentStep || "0", 10);

      // Unauthenticated users can access early steps (0, 1, 2) for signup flow
      if (!isAuthenticated) {
        // Redirect to login if trying to access protected steps 3+
        if (stepNum >= 3) {
          router.replace("/login");
          return;
        }
        return; // Allow access to steps 0-2
      }

      // Authenticated users with completed onboarding shouldn't access onboarding
      if (onboardingCompleted) {
        router.replace("/");
        return;
      }

      // Authenticated but onboarding not complete - enforce minimum step 3
      if (stepNum < 3) {
        router.replace("/onboarding?step=3");
        return;
      }
      return;
    }

    // Protected path logic (secure by default)
    // All paths not in PUBLIC_PATHS require authentication and onboarding
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!onboardingCompleted) {
      router.replace("/onboarding?step=3");
      return;
    }

  }, [isInitialized, pathname, currentStep, authState, router]);

  // Show full-screen loader while initializing
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
