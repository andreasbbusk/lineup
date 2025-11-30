"use client";

import { useOnboardingSubmission } from "@/app/lib/hooks/useOnboardingSubmission";
import { Button } from "@/app/components/ui/buttons";
import { CheckboxCircle } from "@/app/components/ui/checkbox-circle";
import { ErrorMessage } from "@/app/components/ui/error-message";

const OPTIONS = [
  { id: "connect", label: "Connect to fellow musicians" },
  { id: "promote", label: "Promote my music" },
  { id: "find-band", label: "Find a band to play with" },
  { id: "find-services", label: "Find services for my music" },
];

export function OnboardingLookingFor() {
  // The hook handles all the logic, state, and API complexity
  const { 
    lookingFor, 
    toggleOption, 
    submitOnboarding, 
    isPending, 
    error 
  } = useOnboardingSubmission();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="flex w-full flex-col gap-10">
        <h3 className="text-lg font-semibold leading-[19px] tracking-[0.5px] text-black">
          I am looking to
        </h3>

        <div className="flex w-full flex-col gap-4">
          {OPTIONS.map((option) => {
            const isSelected = lookingFor?.includes(option.id) ?? false;
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`flex w-full items-center gap-4 rounded-full border px-2.5 py-4 transition-colors ${
                  isSelected ? "border-crocus-yellow" : "border-black/10"
                }`}
              >
                <CheckboxCircle checked={isSelected} />
                <span className="flex-1 text-left text-base leading-normal tracking-[0.5px] text-black">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex w-full flex-col items-center gap-4">
          <Button
            type="button"
            variant="primary"
            onClick={submitOnboarding}
            disabled={isPending}
            className={`${isPending ? "opacity-50" : "font-normal px-5 py-1!"}`}
          >
            {isPending ? "Setting up profile..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
