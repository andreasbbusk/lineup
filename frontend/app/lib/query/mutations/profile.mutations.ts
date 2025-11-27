"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateProfile } from "../../api/endpoints/auth";
import { useAuthStore } from "../../stores/auth-store";
import { useOnboardingStore } from "../../stores/onboarding-store";
import { ProfileUpdateRequest } from "../../types/api-types";

export function useUpdateProfileMutation() {
  const updateProfileStore = useAuthStore((state) => state.updateProfile);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      username,
      data,
    }: {
      username: string;
      data: ProfileUpdateRequest;
    }) => updateProfile(username, data),
    onSuccess: (profile) => {
      updateProfileStore(profile);
      resetOnboarding(); // Clear onboarding data from localStorage
      router.push("/");
    },
  });
}
