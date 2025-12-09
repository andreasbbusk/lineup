"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserFaq } from "../../api";

/**
 * Hook to fetch user's FAQ answers
 * @param username - The username of the user to fetch FAQ for
 */
export function useFaq(username: string | undefined) {
  return useQuery({
    queryKey: ["faq", username],
    queryFn: async () => {
      if (!username) return [];
      return getUserFaq(username);
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
