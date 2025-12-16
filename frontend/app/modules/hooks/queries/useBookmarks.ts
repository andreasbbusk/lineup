"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getBookmarks, BookmarkResponse } from "@/app/modules/api/bookmarksApi";

/**
 * Hook for fetching user's bookmarks
 *
 * @param options - Additional query options
 * @returns Query result with bookmarks data
 */
export function useBookmarks(
  options?: Omit<
    UseQueryOptions<BookmarkResponse[], Error, BookmarkResponse[], ["bookmarks"]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

