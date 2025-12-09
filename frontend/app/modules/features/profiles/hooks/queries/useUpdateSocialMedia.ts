"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/app/modules/stores/app-store";
import { updateUserSocialMedia } from "../../api";
import type { UserSocialMediaResponse } from "../../types";

export function useUpdateSocialMedia() {
  const queryClient = useQueryClient();
  const username = useAppStore((state) => state.user?.username);

  return useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: Partial<Omit<UserSocialMediaResponse, "userId">>;
    }) => {
      return updateUserSocialMedia(username, data);
    },
    onSuccess: (updatedSocialMedia) => {
      // Invalidate queries so they refetch
      queryClient.invalidateQueries({
        queryKey: ["social-media", username],
      });

      // Optimistic update for instant UI
      queryClient.setQueryData(["social-media", username], updatedSocialMedia);
    },
  });
}
