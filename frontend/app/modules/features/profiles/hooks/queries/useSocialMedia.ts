"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserSocialMedia } from "../../api";

/**
 * Hook to fetch user's social media links
 * @param username - The username of the user to fetch social media for
 */
export function useSocialMedia(username: string | undefined) {
  return useQuery({
    queryKey: ["social-media", username],
    queryFn: async () => {
      if (!username) return null;
      return getUserSocialMedia(username);
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
