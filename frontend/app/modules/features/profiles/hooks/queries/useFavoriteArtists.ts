"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/app/modules/supabase/client";

export interface Artist {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Hook to fetch specific favorite artists by their user IDs
 * @param userIds - Array of user IDs to fetch
 */
export function useFavoriteArtists(userIds: string[]) {
  return useQuery({
    queryKey: ["favoriteArtists", userIds],
    queryFn: async (): Promise<Artist[]> => {
      if (!userIds || userIds.length === 0) return [];

      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (error) {
        console.error("Error fetching favorite artists:", error);
        throw error;
      }

      return (data || []).map((user) => ({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
      }));
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
