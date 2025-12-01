"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useUpdateProfile } from "./useUpdateProfile";

export function useOnboardingSubmission() {
  const router = useRouter();
  const { onboarding, update_onboarding_data, reset_onboarding } =
    useAppStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

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
    const userId = useAppStore.getState().user?.id;

    // Validation
    if (!userId) {
      setSubmitError("User ID not found. Please restart the signup process.");
      return;
    }

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
      const profileData = {
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneCountryCode: Number(data.phone_country_code),
        phoneNumber: Number(data.phone_number),
        yearOfBirth: data.year_of_birth,
        location: data.location,
        userType: data.user_type || "musician",
        lookingFor: data.looking_for || [],
      };

      console.log("🟢 Submitting onboarding with:", {
        userId,
        username: data.username,
        profileData,
      });

      await updateProfile({
        username: userId,
        data: profileData,
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
