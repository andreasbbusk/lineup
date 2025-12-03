"use client";

import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { LoginForm } from "./login-form";

export function LoginWrapper() {
  const { shouldShowContent } = useAuthRedirect({
    strategy: "guest-only",
  });

  // Don't render if we're about to redirect
  // Suspense handles loading state at root level
  if (!shouldShowContent) return null;

  // Show login form for unauthenticated users
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
