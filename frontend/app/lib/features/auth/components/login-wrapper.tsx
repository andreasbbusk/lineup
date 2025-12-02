"use client";

import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { LoginForm } from "./login-form";

export function LoginWrapper() {
  const { isLoading, shouldShowContent } = useAuthRedirect({
    strategy: "guest-only",
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-grey">Loading...</p>
      </div>
    );
  }

  // Don't render if we're about to redirect
  if (!shouldShowContent) return null;

  // Show login form for unauthenticated users
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
