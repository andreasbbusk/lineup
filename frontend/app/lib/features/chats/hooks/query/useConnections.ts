import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/app/lib/features/search";
import type { components } from "@/app/lib/types/api";
import { STALE_TIME } from "../../constants";

type UserSearchResult = components["schemas"]["UserSearchResult"];

/**
 * Hook to fetch user's connections (suggestions)
 */
export function useConnections() {
  return useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await searchApi.searchUsers("", 100);

      // Filter for connected users only and sort alphabetically
      const connectedUsers = (response?.results || [])
        .filter(
          (result): result is UserSearchResult =>
            result.type === "user" && result.isConnected === true
        )
        .sort((a, b) => a.username.localeCompare(b.username));

      return connectedUsers;
    },
    staleTime: STALE_TIME.CONNECTIONS,
  });
}
