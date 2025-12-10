import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recentSearchesApi } from "../api";
import type { SaveRecentSearchDto } from "../types";

const RECENT_SEARCHES_KEY = ["recentSearches"];

export function useRecentSearches() {
  return useQuery({
    queryKey: RECENT_SEARCHES_KEY,
    queryFn: async () => {
      return await recentSearchesApi.getRecentSearches();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useSaveRecentSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchData: SaveRecentSearchDto) => {
      return await recentSearchesApi.saveRecentSearch(searchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_SEARCHES_KEY });
    },
  });
}

export function useDeleteRecentSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await recentSearchesApi.deleteRecentSearch(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_SEARCHES_KEY });
    },
  });
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await recentSearchesApi.clearAllRecentSearches();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_SEARCHES_KEY });
    },
  });
}
