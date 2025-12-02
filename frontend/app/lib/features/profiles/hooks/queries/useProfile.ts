"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/app/lib/stores/app-store";
import {
  updateUserProfile,
  ProfileUpdateRequest,
  getUserProfile,
} from "../../api";

export function useProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => getUserProfile(username),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyProfile() {
  const user = useAppStore((state) => state.user);

  return useQuery({
    queryKey: ["profile", user?.username],
    queryFn: async () => {
      if (!user?.username) throw new Error("Not authenticated");

      return getUserProfile(user.username);
    },
    enabled: !!user?.username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const username = useAppStore((state) => state.user?.username);

  return useMutation({
    mutationFn: async ({
      username,
      data,
    }: {
      username: string;
      data: ProfileUpdateRequest;
    }) => {
      // Calls PUT /users/{username} with auth token
      return updateUserProfile(username, data);
    },
    onSuccess: (updatedProfile) => {
      // Invalidate queries so they refetch
      queryClient.invalidateQueries({
        queryKey: ["profile", username],
      });

      // Optimistic update for instant UI
      queryClient.setQueryData(["profile", username], updatedProfile);
    },
  });
}
