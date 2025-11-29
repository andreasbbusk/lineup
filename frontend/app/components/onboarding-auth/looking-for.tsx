"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useCompleteProfileMutation } from "@/app/lib/query/mutations/auth.mutations";
import { useUpdateProfileMutation } from "@/app/lib/query/mutations/profile.mutations";
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
  const router = useRouter();
  const { onboarding, update_onboarding_data } = useAppStore();
  const [error, setError] = useState<Error | null>(null);

  const { mutate: completeProfile, isPending: isCompletingProfile } =
    useCompleteProfileMutation();
  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfileMutation();

  const isPending = isCompletingProfile || isUpdatingProfile;

  const toggleOption = (id: string) => {
    const current = onboarding.data.looking_for || [];
    update_onboarding_data({
      looking_for: current.includes(id)
        ? current.filter((i: string) => i !== id)
        : [...current, id],
    });
  };

  const handleSubmit = () => {
    setError(null);

    // Validate that username exists
    if (!onboarding.data.username) {
      setError(
        new Error("Missing username. Please restart the signup process.")
      );
      return;
    }

    // Validate we have all required profile data
    if (
      !onboarding.data.first_name ||
      !onboarding.data.last_name ||
      !onboarding.data.phone_number ||
      !onboarding.data.year_of_birth ||
      !onboarding.data.location
    ) {
      setError(
        new Error(
          "Missing required profile information. Please go back and complete previous steps."
        )
      );
      return;
    }

    const phone_country_code = parseInt(
      (onboarding.data.phone_country_code ?? "").replace("+", ""),
      10
    );
    const phone_number = parseInt(onboarding.data.phone_number ?? "", 10);

    if (Number.isNaN(phone_country_code) || Number.isNaN(phone_number)) {
      setError(
        new Error("Invalid phone details. Please review your phone number.")
      );
      return;
    }

    // First, complete the profile with all required data
    completeProfile(
      {
        username: onboarding.data.username,
        first_name: onboarding.data.first_name,
        last_name: onboarding.data.last_name,
        phone_country_code,
        phone_number,
        year_of_birth: onboarding.data.year_of_birth,
        location: onboarding.data.location,
        user_type: onboarding.data.user_type || "musician",
      },
      {
        onSuccess: () => {
          // Then update with looking_for preferences and onboarding_completed flag
          updateProfile(
            {
              username: onboarding.data.username!,
              data: {
                looking_for: onboarding.data.looking_for,
                onboarding_completed: true,
              },
            },
            {
              onSuccess: () => {
                router.push("/");
              },
              onError: (err) => {
                // Profile created but preferences update failed - that's ok
                console.error("Failed to update preferences:", err);
                setError(
                  new Error(
                    "Profile created! You can add your preferences later."
                  )
                );
                setTimeout(() => router.push("/"), 2000);
              },
            }
          );
        },
        onError: (err) => {
          setError(err as Error);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="flex w-full flex-col  gap-10">
        {/* Heading */}
        <h3 className="text-lg font-semibold leading-[19px] tracking-[0.5px] text-black">
          I am looking to
        </h3>

        {/* Options */}
        <div className="flex w-full flex-col gap-4">
          {OPTIONS.map((option) => {
            const isSelected =
              onboarding.data.looking_for?.includes(option.id) ?? false;
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`flex w-full items-center gap-4 rounded-full border px-2.5 py-4 transition-colors ${
                  isSelected ? "border-crocus-yellow" : "border-black/10"
                }`}
              >
                {/* Checkbox */}
                <CheckboxCircle checked={isSelected} />

                {/* Label */}
                <span className="flex-1 text-left text-base leading-normal tracking-[0.5px] text-black">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {error && <ErrorMessage message={error.message} />}

        {/* Actions */}
        <div className="flex w-full flex-col items-center gap-4">
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            className={`${isPending ? "opacity-50" : "font-normal px-5 py-1!"}`}
          >
            {isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
