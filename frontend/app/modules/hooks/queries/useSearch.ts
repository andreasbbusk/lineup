import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/app/modules/api/searchApi";

type SearchTab = "for_you" | "people" | "collaborations" | "services" | "tags";

interface UseSearchParams {
  query: string;
  tab: SearchTab;
  enabled?: boolean;
}

/**
 * Global search hook - reusable across the platform
 *
 * Can be used in:
 * - Search page
 * - Feed filters
 * - Discovery pages
 * - Any feature needing search functionality
 */
export function useSearch({ query, tab, enabled = true }: UseSearchParams) {
  return useQuery({
    queryKey: ["search", tab, query],
    queryFn: async () => {
      // If query is empty, return empty results
      if (!query.trim()) {
        return { results: [] };
      }

      return await searchApi.search(query, tab);
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
