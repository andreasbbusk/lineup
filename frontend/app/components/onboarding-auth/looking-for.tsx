"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
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
  const { onboarding, updateOnboardingData } = useAppStore();
  const user = useAppStore((s) => s.user);

  const {
    mutate: updateProfile,
    isPending,
    error,
  } = useUpdateProfileMutation();

  const toggleOption = (id: string) => {
    const current = onboarding.data.lookingFor || [];
    updateOnboardingData({
      lookingFor: current.includes(id)
        ? current.filter((i: string) => i !== id)
        : [...current, id],
    });
  };

  const handleSubmit = () => {
    if (!user?.id) {
      router.push("/login");
      return;
    }

    // Ensure we have username from onboarding data
    if (!onboarding.data.username) {
      console.error("Username is missing from onboarding data");
      return;
    }

    updateProfile({
      username: onboarding.data.username,
      data: {
        firstName: onboarding.data.firstName!,
        lastName: onboarding.data.lastName!,
        phoneCountryCode: Number(onboarding.data.phoneCountryCode!.replace("+", "")),
        phoneNumber: Number(onboarding.data.phoneNumber!),
        yearOfBirth: onboarding.data.yearOfBirth!,
        location: onboarding.data.location!,
        onboardingCompleted: true,
        userType: onboarding.data.userType,
        lookingFor: onboarding.data.lookingFor,
      },
    });
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
