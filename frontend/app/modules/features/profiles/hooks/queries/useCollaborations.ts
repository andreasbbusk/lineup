"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserCollaborations } from "../../api";

/**
 * Hook to fetch collaborations for a specific user
 * @param userId - The UUID of the user to fetch collaborations for
 */
export function useCollaborations(userId: string | undefined) {
  return useQuery({
    queryKey: ["collaborations", userId],
    queryFn: async () => {
      if (!userId) return [];
      return getUserCollaborations(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
