"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/app/modules/features/search/components/search-bar";
import { SearchTabs } from "@/app/modules/features/search/components/search-tabs";
import { RecentSearches } from "@/app/modules/features/search/components/recent-searches";
import {
  useRecentSearches,
  useSaveRecentSearch,
  useDeleteRecentSearch,
  useClearRecentSearches,
} from "@/app/modules/features/search/hooks/useRecentSearches";
import type {
  SearchTab,
  SearchResult,
} from "@/app/modules/features/search/types";
import { useSearch } from "@/app/modules/hooks/queries/useSearch";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // State Management
  // ============================================================================

  // Get query and tab from URL, with defaults
  const urlQuery = searchParams.get("q") || "";
  const urlTab = (searchParams.get("tab") as SearchTab) || "for_you";

  const [query, setQuery] = useState(urlQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>(urlTab);

  // Sync URL params when query or tab changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeTab !== "for_you") params.set("tab", activeTab);

    const newUrl = params.toString()
      ? `/search?${params.toString()}`
      : "/search";

    router.push(newUrl, { scroll: false });
  }, [query, activeTab, router]);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: searchResults, isLoading } = useSearch({
    query,
    tab: activeTab,
  });

  const { data: recentSearches, isLoading: isLoadingRecent } =
    useRecentSearches();
  const saveRecentSearchMutation = useSaveRecentSearch();
  const deleteRecentSearchMutation = useDeleteRecentSearch();
  const clearRecentSearchesMutation = useClearRecentSearches();

  // Save search to recent searches when user performs a search
  useEffect(() => {
    if (query.trim() && searchResults) {
      saveRecentSearchMutation.mutate({
        query,
        tab: activeTab,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab, searchResults]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
  };

  const handleSelectRecentSearch = (
    searchQuery: string,
    searchTab: SearchTab
  ) => {
    setQuery(searchQuery);
    setActiveTab(searchTab);
  };

  const handleDeleteRecentSearch = (id: string) => {
    deleteRecentSearchMutation.mutate(id);
  };

  const handleClearRecentSearches = () => {
    clearRecentSearchesMutation.mutate();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <main className="flex flex-col h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Header with search and tabs */}
      <div className="flex flex-col px-4 pt-4 pb-3 shrink-0 gap-3">
        <SearchBar value={query} onChange={handleQueryChange} />
        <SearchTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 bg-white overflow-y-auto">
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : query.trim() ? (
            // Placeholder for search results (Phase 4 - no result rendering yet)
            <div className="space-y-4">
              <p className="text-sm text-grey">
                {searchResults?.results.length || 0} results found
              </p>
              <div className="space-y-2">
                {searchResults?.results.map(
                  (result: SearchResult, index: number) => (
                    <div
                      key={`${result.type}-${index}`}
                      className="p-4 bg-grey/10 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {result.type.toUpperCase()} Result
                      </p>
                      <p className="text-xs text-grey mt-1">
                        Result rendering will be implemented later
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <RecentSearches
              recentSearches={recentSearches}
              isLoading={isLoadingRecent}
              onSelect={handleSelectRecentSearch}
              onDelete={handleDeleteRecentSearch}
              onClearAll={handleClearRecentSearches}
              isDeleting={deleteRecentSearchMutation.isPending}
            />
          )}
        </div>
      </div>
    </main>
  );
}
