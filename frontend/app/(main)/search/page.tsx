"use client";

import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { RecentSearches } from "@/app/modules/features/search/components/recent-searches";
import { SearchBar } from "@/app/modules/features/search/components/search-bar";
import { SearchResults } from "@/app/modules/features/search/components/search-results";
import { SearchTabs } from "@/app/modules/features/search/components/search-tabs";
import { TAB_ORDER } from "@/app/modules/features/search/constants";
import { useSearchPage } from "@/app/modules/features/search/hooks/useSearchPage";
import type {
  SearchTab,
  TagSearchResult,
} from "@/app/modules/features/search/types";
import { useSearch } from "@/app/modules/hooks/queries/useSearch";
import { usePosts } from "@/app/modules/hooks/queries/usePosts";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const urlQuery = searchParams.get("q") || "";
  const urlTab = (searchParams.get("tab") as SearchTab) || "for_you";

  // Main search page logic
  const {
    query,
    handleQueryChange,
    hasQuery,
    activeTab,
    activeTabIndex,
    handleTabChange,
    searchResults,
    isLoading,
    recentSearches,
    isLoadingRecent,
    handleSaveSearch,
    handleSelectRecentSearch,
    handleDeleteRecentSearch,
    handleClearRecentSearches,
    isDeleting,
  } = useSearchPage({
    initialQuery: urlQuery,
    initialTab: urlTab,
  });

  // Tag search and posts queries (for tags tab)
  const { data: tagSearchResults, isLoading: isLoadingTags } = useSearch({
    query,
    tab: "tags",
    enabled: activeTab === "tags" && query.trim().length > 0,
  });

  // Extract tag names from search results
  const tagNames = useMemo(() => {
    if (!tagSearchResults?.results) return [];
    return tagSearchResults.results
      .filter((result): result is TagSearchResult => result.type === "tag")
      .map((result) => result.name);
  }, [tagSearchResults]);

  // Fetch posts filtered by tag names
  // Only fetch posts if we have matching tags from the search query
  const shouldFetchPosts =
    activeTab === "tags" && query.trim().length > 0 && tagNames.length > 0;
  const { data: postsData, isLoading: isLoadingPosts } = usePosts(
    {
      tags: shouldFetchPosts ? tagNames : undefined,
      type: "note",
      limit: 50,
      includeEngagement: true,
      includeMedia: true,
    },
    { enabled: shouldFetchPosts }
  );

  const isLoadingTagsTab = isLoadingTags || isLoadingPosts;
  const posts = postsData?.data || [];

  // Event handlers
  const handleCancel = useCallback(() => {
    router.push("/feed");
  }, [router]);

  const handleStartChat = useCallback(
    (authorId: string, postId: string) => {
      router.push(`/chats?userId=${authorId}&postId=${postId}`);
    },
    [router]
  );

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      {/* Header with search and tabs */}
      <div className="flex flex-col px-4 pt-4 pb-3 shrink-0 gap-3 bg-white">
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onCancel={handleCancel}
          onSubmit={handleSaveSearch}
        />
        <SearchTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 bg-white overflow-y-auto">
        <div className="px-4 py-4">
          {hasQuery ? (
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{
                  x: `${-activeTabIndex * 100}%`,
                }}
                transition={{
                  type: "tween",
                  duration: 0.3,
                }}
              >
                {TAB_ORDER.map((tab) => (
                  <div key={tab} className="w-full shrink-0">
                    {tab === activeTab && (
                      <>
                        {activeTab === "tags" ? (
                          isLoadingTagsTab ? (
                            <div className="flex items-center justify-center py-12">
                              <LoadingSpinner />
                            </div>
                          ) : (
                            <SearchResults
                              results={searchResults}
                              activeTab={activeTab}
                              query={query}
                              onStartChat={handleStartChat}
                              onResultClick={handleSaveSearch}
                              posts={posts}
                              tagNames={tagNames}
                              isLoadingPosts={isLoadingPosts}
                            />
                          )
                        ) : isLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <LoadingSpinner />
                          </div>
                        ) : (
                          <SearchResults
                            results={searchResults}
                            activeTab={activeTab}
                            query={query}
                            onStartChat={handleStartChat}
                            onResultClick={handleSaveSearch}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          ) : (
            <RecentSearches
              recentSearches={recentSearches}
              isLoading={isLoadingRecent}
              onSelect={handleSelectRecentSearch}
              onDelete={handleDeleteRecentSearch}
              onClearAll={handleClearRecentSearches}
              isDeleting={isDeleting}
            />
          )}
        </div>
      </div>
    </main>
  );
}
