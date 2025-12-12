"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserLookingFor } from "../../api";

/**
 * Hook to fetch what the user is looking for
 * @param username - The username of the user to fetch looking for data
 */
export function useLookingFor(username: string | undefined) {
  return useQuery({
    queryKey: ["looking-for", username],
    queryFn: async () => {
      if (!username) return [];
      return getUserLookingFor(username);
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
