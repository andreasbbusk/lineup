"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAppStore } from "@/app/lib/stores/app-store";
import {
  updateUserProfile,
  ProfileUpdateRequest,
  getUserProfile,
} from "../../api";

export function useProfile(username: string) {
  const queryKey = useMemo(() => ["profile", username || null], [username]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!username) return null;
      return getUserProfile(username);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!username,
  });
}

export function useMyProfile() {
  const user = useAppStore((state) => state.user);
  const username = user?.username;
  const queryKey = useMemo(() => ["profile", username || null], [username]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!username) {
        console.error("useMyProfile: No username in user store", { user });
        throw new Error(
          "No username found. Please ensure you are logged in and have completed onboarding."
        );
      }
      return getUserProfile(username);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!username,
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
