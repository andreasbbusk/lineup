"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useUpdateProfileMutation } from "@/app/lib/query/mutations/profile.mutations";
import { useAuthStore } from "@/app/lib/stores/auth-store";
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
  const { data, updateData } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);

  const {
    mutate: updateProfile,
    isPending,
    error,
  } = useUpdateProfileMutation();

  const toggleOption = (id: string) => {
    const current = data.lookingFor || [];
    updateData({
      lookingFor: current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id],
    });
  };

  const handleSubmit = () => {
    if (!user?.id) {
      router.push("/login");
      return;
    }

    updateProfile({
      username: data.username || user.email.split("@")[0],
      data: {
        firstName: data.firstName!,
        lastName: data.lastName!,
        phoneCountryCode: Number(data.phoneCountryCode!.replace("+", "")),
        phoneNumber: Number(data.phoneNumber!),
        location: data.location!,
        onboardingCompleted: true,
      },
    });
  };

  const handleSkip = () => {
    handleSubmit();
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
            const isSelected = data.lookingFor?.includes(option.id) ?? false;
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

          <button
            type="button"
            onClick={handleSkip}
            disabled={isPending}
            className="text-base leading-normal tracking-[0.5px] text-text-secondary underline decoration-solid underline-offset-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
