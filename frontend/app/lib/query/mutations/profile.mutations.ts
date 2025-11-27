"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppStore } from "../../stores/app-store";
import { ProfileUpdateRequest } from "../../types/api-types";
import { updateProfile } from "../../api/endpoints/auth";

export function useUpdateProfileMutation() {
  const updateProfileStore = useAppStore((state) => state.updateProfile);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: ProfileUpdateRequest;
    }) => {
      // Call backend API endpoint
      return updateProfile(username, data);
    },
    onSuccess: (profile) => {
      updateProfileStore(profile);
      resetOnboarding(); // Clear onboarding data from localStorage
      router.push("/");
    },
  });
}
