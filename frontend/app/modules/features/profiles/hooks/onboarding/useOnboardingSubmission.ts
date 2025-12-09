"use client";

import { useState } from "react";
import { useAppStore } from "@/app/modules/stores/Store";
import { useUpdateProfile } from "../queries/useProfile";
import type { ProfileUpdateRequest, LookingForType } from "../../types";

export function useOnboardingSubmission() {
  const { onboarding, updateOnboardingData, resetOnboarding, initializeAuth } =
    useAppStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const toggleOption = (id: LookingForType) => {
    const current = onboarding.data.lookingFor || [];
    updateOnboardingData({
      lookingFor: current.includes(id)
        ? current.filter((i) => i !== id)
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
        onboardingCompleted: true, // ✅ Mark as complete
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

      // 1. Submit to backend
      await updateProfile({
        username: data.username,
        data: profileData as unknown as ProfileUpdateRequest,
      });

      // 2. Re-fetch auth state (picks up onboardingCompleted: true from database)
      await initializeAuth();

      // 3. Clear onboarding form data (no longer needed)
      resetOnboarding();

      // 4. AuthGuard will see user.onboardingCompleted = true and redirect to /
      // No need for manual router.push - let AuthGuard handle it
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
