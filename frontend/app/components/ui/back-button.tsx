// frontend/app/components/onboarding-auth/onboarding-back-button.tsx
"use client";

import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { ArrowLeftIcon } from "lucide-react";

interface OnboardingBackButtonProps {
  className?: string;
}

export function OnboardingBackButton({
  className = "",
}: OnboardingBackButtonProps) {
  const { prevStep } = useOnboardingNavigation();

  return (
    <button
      onClick={prevStep}
      className={`flex h-10 w-10 items-center justify-center transition-all active:scale-90 ${className}`}
      aria-label="Go back to previous step"
    >
      <ArrowLeftIcon size={40} className="text-text-muted" />
    </button>
  );
}
