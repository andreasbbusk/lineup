import { useState, useCallback, useMemo } from "react";
import type { SearchTab } from "../types";
import { useSearch } from "@/app/modules/hooks/queries/useSearch";
import { useSearchTabs } from "./useSearchTabs";
import { useSearchUrlSync } from "./useSearchUrlSync";
import {
  useRecentSearches,
  useSaveRecentSearch,
  useDeleteRecentSearch,
  useClearRecentSearches,
} from "./useRecentSearches";

interface UseSearchPageProps {
  initialQuery?: string;
  initialTab?: SearchTab;
}

/**
 * Main hook for search page logic
 * Combines query management, tab navigation, URL sync, and recent searches
 */
export const useSearchPage = ({
  initialQuery = "",
  initialTab = "for_you",
}: UseSearchPageProps) => {
  const [query, setQuery] = useState(initialQuery);

  // Tab management with prefetching
  const { activeTab, activeTabIndex, handleTabChange } = useSearchTabs({
    initialTab,
    query,
  });

  // Sync with URL
  useSearchUrlSync({ query, activeTab });

  // Search data
  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useSearch({
    query,
    tab: activeTab,
  });

  // Recent searches
  const { data: recentSearches, isLoading: isLoadingRecent } =
    useRecentSearches();
  const saveRecentSearchMutation = useSaveRecentSearch();
  const deleteRecentSearchMutation = useDeleteRecentSearch();
  const clearRecentSearchesMutation = useClearRecentSearches();

  // Event handlers
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleSaveSearch = useCallback(() => {
    if (query.trim() && searchResults) {
      saveRecentSearchMutation.mutate({
        query,
        tab: activeTab,
      });
    }
  }, [query, activeTab, searchResults, saveRecentSearchMutation]);

  const handleSelectRecentSearch = useCallback(
    (searchQuery: string, searchTab: SearchTab) => {
      setQuery(searchQuery);
      handleTabChange(searchTab);
    },
    [handleTabChange]
  );

  const handleDeleteRecentSearch = useCallback(
    (id: string) => {
      deleteRecentSearchMutation.mutate(id);
    },
    [deleteRecentSearchMutation]
  );

  const handleClearRecentSearches = useCallback(() => {
    clearRecentSearchesMutation.mutate();
  }, [clearRecentSearchesMutation]);

  // Computed values
  const hasQuery = useMemo(() => query.trim().length > 0, [query]);
  const searchResultsList = useMemo(
    () => searchResults?.results || [],
    [searchResults]
  );

  return {
    // Query state
    query,
    handleQueryChange,
    hasQuery,

    // Tab state
    activeTab,
    activeTabIndex,
    handleTabChange,

    // Search results
    searchResults: searchResultsList,
    isLoading,
    refetchSearch: refetch,

    // Recent searches
    recentSearches,
    isLoadingRecent,
    handleSaveSearch,
    handleSelectRecentSearch,
    handleDeleteRecentSearch,
    handleClearRecentSearches,
    isDeleting: deleteRecentSearchMutation.isPending,
  };
};
