"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useUpdateProfileMutation } from "@/app/lib/query/mutations/profile.mutations";
import { useAuthStore } from "@/app/lib/stores/auth-store";
import { Button } from "@/app/components/ui/buttons";

const OPTIONS = [
  { id: "connect", label: "Network with musicians" },
  { id: "promote", label: "Promote my music" },
  { id: "find-band", label: "Find band members" },
  { id: "find-services", label: "Find music services" },
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
      username: user.email.split("@")[0],
      data: {
        username: data.username!,
        firstName: data.firstName!,
        lastName: data.lastName!,
        phoneCountryCode: Number(data.phoneCountryCode!.replace("+", "")),
        phoneNumber: Number(data.phoneNumber!),
        yearOfBirth: data.yearOfBirth!,
        location: data.location!,
        userType: data.userType!,
        onboardingCompleted: true,
      },
    });
  };

  return (
    <div className="flex w-full max-w-[260px] flex-col items-center gap-8">
      <div className="w-full space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#404040]">
            What are you looking for?
          </h3>
          <p className="mt-2 text-sm text-grey">Select what interests you</p>
        </div>

        {error && (
          <div className="w-full rounded-lg border border-maroon bg-maroon/10 px-4 py-3 text-sm text-maroon">
            {error.message}
          </div>
        )}

        <div className="space-y-3">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`w-full rounded-[25px] border p-4 text-left transition ${
                data.lookingFor?.includes(option.id)
                  ? "border-grey bg-grey/5"
                  : "border-[rgba(0,0,0,0.1)]"
              }`}
            >
              <span className="text-base font-medium text-[#404040]">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={handleSubmit}
        className={isPending ? "opacity-50" : ""}
      >
        {isPending ? "Saving..." : "Complete"}
      </Button>
    </div>
  );
}
