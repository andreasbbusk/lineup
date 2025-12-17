"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAppStore } from "@/app/modules/stores/Store";
import { updateUserProfile, getUserProfile } from "../../api";
import type { ProfileUpdateRequest } from "../../types";

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
        throw new Error(
          "No username found. Please ensure you are logged in and have completed onboarding."
        );
      }
      return getUserProfile(username);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
    enabled: !!username,
    placeholderData: keepPreviousData,
    refetchOnMount: false,
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

/**
 * Hook for fetching multiple user profiles at once
 * Useful for story carousels or lists of users
 */
export function useProfiles(usernames: string[]) {
  const queryKey = useMemo(
    () => ["profiles", [...usernames].sort().join(",")],
    [usernames]
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      const uniqueUsernames = Array.from(new Set(usernames));
      const profiles = await Promise.all(
        uniqueUsernames.map((username) => getUserProfile(username))
      );
      return profiles;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - same as single profile
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: usernames.length > 0,
  });
}
