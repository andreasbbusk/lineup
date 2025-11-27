"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useSignupBasicMutation } from "@/app/lib/query/mutations/auth.mutations";
import { useUpdateProfileMutation } from "@/app/lib/query/mutations/profile.mutations";
import { Button } from "@/app/components/ui/buttons";
import { CheckboxCircle } from "@/app/components/ui/checkbox-circle";
import { ErrorMessage } from "@/app/components/ui/error-message";
import { SignupRequest } from "@/app/lib/types/api-types";

const OPTIONS = [
  { id: "connect", label: "Connect to fellow musicians" },
  { id: "promote", label: "Promote my music" },
  { id: "find-band", label: "Find a band to play with" },
  { id: "find-services", label: "Find services for my music" },
];

export function OnboardingLookingFor() {
  const router = useRouter();
  const { onboarding, updateOnboardingData, user, markAccountCreated } = useAppStore();
  const [error, setError] = useState<Error | null>(null);

  const {
    mutate: createAccount,
    isPending: isCreatingAccount,
  } = useSignupBasicMutation();

  const {
    mutate: updateProfile,
    isPending: isUpdatingProfile,
  } = useUpdateProfileMutation();

  const isPending = isCreatingAccount || isUpdatingProfile;

  const toggleOption = (id: string) => {
    const current = onboarding.data.lookingFor || [];
    updateOnboardingData({
      lookingFor: current.includes(id)
        ? current.filter((i: string) => i !== id)
        : [...current, id],
    });
  };

  const handleSubmit = () => {
    setError(null);

    // Validate we have all required data
    if (!onboarding.data.email || !onboarding.data.password || !onboarding.data.username) {
      setError(new Error("Missing required account information. Please go back and complete all steps."));
      return;
    }

    if (!onboarding.data.firstName || !onboarding.data.lastName || !onboarding.data.phoneNumber) {
      setError(new Error("Missing required profile information. Please go back and complete all steps."));
      return;
    }

    // Step 1: Create account with all data if not already created
    if (!onboarding.data.accountCreated) {
      const signupData: SignupRequest = {
        email: onboarding.data.email,
        password: onboarding.data.password,
        username: onboarding.data.username,
        firstName: onboarding.data.firstName,
        lastName: onboarding.data.lastName,
        phoneCountryCode: Number(onboarding.data.phoneCountryCode!.replace("+", "")),
        phoneNumber: Number(onboarding.data.phoneNumber),
        yearOfBirth: onboarding.data.yearOfBirth!,
        location: onboarding.data.location!,
        userType: onboarding.data.userType || "musician",
      };

      createAccount(signupData, {
        onSuccess: (response) => {
          markAccountCreated();

          // Step 2: Update looking_for preferences
          updateProfile({
            username: response.profile.username,
            data: {
              lookingFor: onboarding.data.lookingFor,
              onboardingCompleted: true,
            },
          }, {
            onSuccess: () => {
              router.push("/");
            },
            onError: (err) => {
              // Account created but looking_for failed - that's ok, user can add later
              console.error("Failed to update looking_for preferences:", err);
              setError(new Error("Account created! You can add your preferences later in your profile."));
              // Still redirect to home after showing message
              setTimeout(() => router.push("/"), 2000);
            },
          });
        },
        onError: (err) => {
          setError(err as Error);
        },
      });
    } else {
      // Account already created, just update looking_for
      if (!user?.id || !onboarding.data.username) {
        setError(new Error("Authentication error. Please try logging in again."));
        return;
      }

      updateProfile({
        username: onboarding.data.username,
        data: {
          lookingFor: onboarding.data.lookingFor,
          onboardingCompleted: true,
        },
      }, {
        onSuccess: () => {
          router.push("/");
        },
        onError: (err) => {
          setError(err as Error);
        },
      });
    }
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
            const isSelected = onboarding.data.lookingFor?.includes(option.id) ?? false;
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
