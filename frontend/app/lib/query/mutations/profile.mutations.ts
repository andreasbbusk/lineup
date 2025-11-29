"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppStore } from "../../stores/app-store";
import { ProfileUpdateRequest } from "../../types/api-types";
import { updateProfile } from "../../api/endpoints/auth";

export function useUpdateProfileMutation() {
  const update_profile = useAppStore((state) => state.update_profile);
  const reset_onboarding = useAppStore((state) => state.reset_onboarding);
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
      update_profile(profile);
      reset_onboarding(); // Clear onboarding data from localStorage
      router.push("/");
    },
  });
}
