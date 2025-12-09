import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/app/modules/api/search-api";

/**
 * Generic hook to search for users
 *
 * This is infrastructure - any feature that needs to search users should use this hook.
 * Features should NOT create their own user search hooks.
 */
export function useUserSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search", "people", query],
    queryFn: () => searchApi.searchUsers(query),
    enabled,
    staleTime: 30_000, // 30 seconds
  });
}
