"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { LoadingSpinner } from "@/app/components/loading-spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isInitialized = useAppStore((state) => state.isInitialized);
  const user = useAppStore((state) => state.user);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize auth immediately on first render (not in useEffect)
  if (!isInitialized) {
    // This only runs once because isInitialized becomes true
    useAppStore.getState().initializeAuth();
  }

  // Handle redirects after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const redirectPath = getRedirectPath(
      pathname,
      !!user,
      user?.onboardingCompleted ?? false
    );

    if (redirectPath) {
      setIsRedirecting(true);
      router.replace(redirectPath);
    } else {
      setIsRedirecting(false);
    }
  }, [isInitialized, user, pathname, router]);

  // Show loader while initializing or redirecting
  if (!isInitialized || isRedirecting) {
    return <LoadingSpinner variant="rays" />;
  }

  return <>{children}</>;
}

function getRedirectPath(
  pathname: string,
  isAuthenticated: boolean,
  onboardingCompleted: boolean
): string | null {
  if (pathname === "/") return null;

  if (pathname.startsWith("/login") || pathname.includes("(auth)/login")) {
    if (!isAuthenticated) return null;
    return onboardingCompleted ? "/" : "/onboarding?step=3";
  }

  if (
    pathname.startsWith("/onboarding") ||
    pathname.includes("(auth)/onboarding")
  ) {
    if (!isAuthenticated) return null;
    if (onboardingCompleted) return "/";
    return null;
  }

  const protectedPaths = ["/chats", "/posts", "/profile", "/search", "/create"];
  const isProtected =
    protectedPaths.some((path) => pathname.startsWith(path)) ||
    pathname.includes("(main)");

  if (isProtected) {
    if (!isAuthenticated) return "/login";
    if (!onboardingCompleted) return "/onboarding";
    return null;
  }

  return null;
}
