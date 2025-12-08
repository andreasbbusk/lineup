"use client";

import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useAppStore } from "@/app/lib/stores/app-store";
import { updateUserProfile, getUserProfile } from "../../api";
import type { ProfileUpdateRequest } from "../../types";

export function useProfile(username: string) {
  const queryKey = useMemo(() => ["profile", username || null], [username]);

  return useSuspenseQuery({
    queryKey,
    queryFn: async () => {
      if (!username) return null;
      return getUserProfile(username);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyProfile() {
  const user = useAppStore((state) => state.user);
  const username = user?.username;
  const queryKey = useMemo(() => ["profile", username || null], [username]);

  return useSuspenseQuery({
    queryKey,
    queryFn: async () => {
      if (!username) return null;
      return getUserProfile(username);
    },
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
