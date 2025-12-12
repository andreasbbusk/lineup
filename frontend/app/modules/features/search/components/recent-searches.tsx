"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import type { RecentSearch, SearchTab } from "../types";
import { X } from "lucide-react";

interface RecentSearchesProps {
  recentSearches?: RecentSearch[];
  isLoading?: boolean;
  onSelect: (query: string, tab: SearchTab) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isDeleting?: boolean;
}

function RecentSearchesComponent({
  recentSearches,
  onSelect,
  onDelete,
  onClearAll,
  isDeleting,
}: RecentSearchesProps) {
  const handleSelectSearch = useCallback(
    (query: string, tab: SearchTab) => {
      onSelect(query, tab);
    },
    [onSelect]
  );

  const handleDeleteSearch = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDelete(id);
    },
    [onDelete]
  );
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-grey">Recent</p>
        {recentSearches && recentSearches.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-grey hover:text-black transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {recentSearches &&
          recentSearches.length > 0 &&
          recentSearches.map((search) => (
            <div
              key={search.id}
              className="group flex items-center gap-3 cursor-pointer active:opacity-70"
              onClick={() =>
                handleSelectSearch(search.searchQuery, search.searchTab)
              }
            >
              <div className="w-12 h-12 rounded-full bg-grey/20 flex items-center justify-center shrink-0">
                <Image
                  src="/icons/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                  className="opacity-40"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-black truncate">
                  {search.searchQuery}
                </p>
                <p className="text-sm text-grey truncate capitalize">
                  {search.searchTab.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteSearch(e, search.id)}
                disabled={isDeleting}
                aria-label="Remove search"
              >
                <X className="size-4 text-black" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export const RecentSearches = memo(RecentSearchesComponent);
