// frontend/app/lib/hooks/useOnboardingSubmission.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useUpdateProfileMutation } from "@/app/lib/query/mutations/profile.mutations";

export function useOnboardingSubmission() {
  const router = useRouter();
  const { onboarding, update_onboarding_data, reset_onboarding } =
    useAppStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: updateProfile, isPending } =
    useUpdateProfileMutation();

  const toggleOption = (id: string) => {
    const current = onboarding.data.looking_for || [];
    update_onboarding_data({
      looking_for: current.includes(id)
        ? current.filter((i: string) => i !== id)
        : [...current, id],
    });
  };

  const submitOnboarding = async () => {
    setSubmitError(null);
    const data = onboarding.data;

    // Validation
    if (!data.username) {
      setSubmitError("Missing username. Please restart the signup process.");
      return;
    }

    if (
      !data.first_name ||
      !data.last_name ||
      !data.phone_number ||
      !data.phone_country_code ||
      !data.year_of_birth ||
      !data.location
    ) {
      setSubmitError(
        "Missing required profile info. Please complete previous steps."
      );
      return;
    }

    try {
      // Single call to updateProfile with all onboarding data
      await updateProfile({
        username: data.username,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone_country_code: data.phone_country_code,
          phone_number: data.phone_number,
          year_of_birth: data.year_of_birth,
          location: data.location,
          user_type: data.user_type || "musician",
          looking_for: data.looking_for || [],
        },
      });

      reset_onboarding();
      router.push("/");
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return {
    lookingFor: onboarding.data.looking_for,
    toggleOption,
    submitOnboarding,
    isPending,
    error: submitError,
  };
}
