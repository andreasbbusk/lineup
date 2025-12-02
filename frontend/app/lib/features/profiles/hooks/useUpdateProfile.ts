"use client";

import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "../../../stores/app-store";
import { updateUserProfile, ProfileUpdateRequest } from "../api";

export function useUpdateProfile() {
  const updateProfile = useAppStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: ProfileUpdateRequest;
    }) => {
      return updateUserProfile(username, data);
    },
    onSuccess: (profile) => {
      // Just update the store with the new profile data
      updateProfile(profile);
    },
  });
}
