"use client";

import { memo, useMemo, useCallback } from "react";
import { UserSearchResultCard } from "./user-card";
import { CollaborationSearchResultCard } from "./collaboration-card";
import { ServiceSearchResultCard } from "./services-card";
import { TagSearchResultCard } from "./tag-card";
import { getCategoryLabel } from "../utils/helpers";
import type {
  SearchTab,
  SearchResult,
  UserSearchResult,
  CollaborationSearchResult,
  ServiceSearchResult,
  TagSearchResult,
  ForYouSearchResult,
} from "../types";

interface SearchResultsProps {
  results: SearchResult[];
  activeTab: SearchTab;
  query: string;
  onConnect?: (userId: string) => void;
  isConnecting?: boolean;
  onStartChat?: (authorId: string, postId: string) => void;
  onResultClick?: () => void;
}

function SearchResultsComponent({
  results,
  activeTab,
  query,
  onConnect,
  isConnecting,
  onStartChat,
  onResultClick,
}: SearchResultsProps) {
  // Memoize grouped results for "for_you" tab
  const groupedResults = useMemo(() => {
    if (activeTab !== "for_you") return null;

    const grouped: Record<string, ForYouSearchResult[]> = {
      user: [],
      collaboration: [],
      service: [],
      tag: [],
    };

    results.forEach((result) => {
      const forYouResult = result as ForYouSearchResult;
      if (forYouResult.entityType && grouped[forYouResult.entityType]) {
        grouped[forYouResult.entityType].push(forYouResult);
      }
    });

    return grouped;
  }, [results, activeTab]);

  // Memoize result count for "for_you" tab
  const forYouTotalCount = useMemo(() => {
    if (!groupedResults) return 0;
    const categories = ["user", "collaboration", "service", "tag"];
    return categories.reduce((sum, category) => {
      return sum + Math.min(groupedResults[category].length, 5);
    }, 0);
  }, [groupedResults]);

  // Memoize render function to prevent recreation
  const renderResult = useCallback(
    (result: SearchResult, index: number) => {
      const key = `${result.type}-${index}`;

      switch (result.type) {
        case "user":
          return (
            <div key={key} onClick={onResultClick}>
              <UserSearchResultCard
                user={result as UserSearchResult}
                onConnect={onConnect}
                isConnecting={isConnecting}
              />
            </div>
          );
        case "collaboration":
          return (
            <div key={key} onClick={onResultClick}>
              <CollaborationSearchResultCard
                collaboration={result as CollaborationSearchResult}
                onStartChat={onStartChat}
              />
            </div>
          );
        case "service":
          return (
            <div key={key} onClick={onResultClick}>
              <ServiceSearchResultCard
                service={result as ServiceSearchResult}
              />
            </div>
          );
        case "tag":
          return (
            <div key={key} onClick={onResultClick}>
              <TagSearchResultCard tag={result as TagSearchResult} />
            </div>
          );
        default:
          return null;
      }
    },
    [onConnect, isConnecting, onStartChat, onResultClick]
  );

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          className="text-grey/40 mb-4"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 20L17 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No results found
        </h3>
        <p className="text-sm text-grey max-w-sm">
          No {activeTab === "for_you" ? "results" : activeTab} found for &quot;
          {query}&quot;. Try a different search term.
        </p>
      </div>
    );
  }

  // Render For You tab with grouped results
  if (activeTab === "for_you" && groupedResults) {
    const categories = ["user", "collaboration", "service", "tag"];

    return (
      <div>
        <div className="mb-4">
          <p className="text-sm text-grey">
            {forYouTotalCount} {forYouTotalCount === 1 ? "result" : "results"}{" "}
            found
          </p>
        </div>
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryResults = groupedResults[category].slice(0, 5);

            if (categoryResults.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-sm text-grey mb-3 font-medium">
                  {getCategoryLabel(category)}
                </p>
                <div className="space-y-3">
                  {categoryResults.map((forYouResult, index) => {
                    const key = `${category}-${index}`;

                    switch (forYouResult.entityType) {
                      case "user":
                        return (
                          <div key={key} onClick={onResultClick}>
                            <UserSearchResultCard
                              user={
                                forYouResult.additionalInfo as UserSearchResult
                              }
                              onConnect={onConnect}
                              isConnecting={isConnecting}
                            />
                          </div>
                        );
                      case "collaboration":
                        return (
                          <div key={key} onClick={onResultClick}>
                            <CollaborationSearchResultCard
                              collaboration={
                                forYouResult.additionalInfo as CollaborationSearchResult
                              }
                              onStartChat={onStartChat}
                            />
                          </div>
                        );
                      case "service":
                        return (
                          <div key={key} onClick={onResultClick}>
                            <ServiceSearchResultCard
                              service={
                                forYouResult.additionalInfo as ServiceSearchResult
                              }
                            />
                          </div>
                        );
                      case "tag":
                        return (
                          <div key={key} onClick={onResultClick}>
                            <TagSearchResultCard
                              tag={
                                forYouResult.additionalInfo as TagSearchResult
                              }
                            />
                          </div>
                        );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Regular rendering for other tabs
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-grey">
          {results.length} {results.length === 1 ? "result" : "results"} found
        </p>
      </div>
      <div className="space-y-3">{results.map(renderResult)}</div>
    </div>
  );
}

export const SearchResults = memo(SearchResultsComponent);
