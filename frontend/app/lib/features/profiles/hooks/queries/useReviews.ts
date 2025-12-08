"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserReviews } from "../../api";

/**
 * Hook to fetch reviews for a specific user
 * @param username - The username of the user to fetch reviews for
 */
export function useReviews(username: string | undefined) {
  return useQuery({
    queryKey: ["reviews", username],
    queryFn: async () => {
      if (!username) return [];
      return getUserReviews(username);
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
