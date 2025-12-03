"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useUpdateProfile } from "../queries/useProfile";
import type { ProfileUpdateRequest } from "../../api";

export function useOnboardingSubmission() {
  const router = useRouter();
  const { onboarding, updateOnboardingData, resetOnboarding } = useAppStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const toggleOption = (id: string) => {
    const current = onboarding.data.lookingFor || [];
    updateOnboardingData({
      lookingFor: current.includes(id)
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
      !data.firstName ||
      !data.lastName ||
      !data.phoneNumber ||
      !data.phoneCountryCode ||
      !data.yearOfBirth ||
      !data.location
    ) {
      setSubmitError(
        "Missing required profile info. Please complete previous steps."
      );
      return;
    }

    try {
      // Ensure numeric fields are numbers (localStorage might serialize them as strings)
      const profileData = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneCountryCode: Number(data.phoneCountryCode),
        phoneNumber: Number(data.phoneNumber),
        yearOfBirth: Number(data.yearOfBirth),
        location: data.location,
        userType: data.userType || "musician",
        lookingFor: data.lookingFor || [],
        onboardingCompleted: true,
      };

      // Validate that conversions were successful
      if (
        isNaN(profileData.phoneCountryCode) ||
        isNaN(profileData.phoneNumber) ||
        isNaN(profileData.yearOfBirth)
      ) {
        setSubmitError("Invalid numeric values. Please check your input.");
        return;
      }

      await updateProfile({
        username: data.username,
        // Cast to match generated API types (backend DTO expects numbers and will convert strings)
        data: profileData as unknown as ProfileUpdateRequest,
      });

      resetOnboarding();
      router.push("/");
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return {
    lookingFor: onboarding.data.lookingFor,
    toggleOption,
    submitOnboarding,
    isPending,
    error: submitError,
  };
}
