"use client";

import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "../../../stores/app-store";
import { ProfileUpdateRequest } from "../types";
import { updateUserProfile } from "../api";

export function useUpdateProfile() {
  const update_profile = useAppStore((state) => state.update_profile);

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
      update_profile(profile);
    },
  });
}
