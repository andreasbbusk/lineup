"use client";

import Image from "next/image";
import type { RecentSearch, SearchTab } from "../types";

interface RecentSearchesProps {
  recentSearches?: RecentSearch[];
  isLoading?: boolean;
  onSelect: (query: string, tab: SearchTab) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isDeleting?: boolean;
}

export function RecentSearches({
  recentSearches,
  onSelect,
  onDelete,
  onClearAll,
  isDeleting,
}: RecentSearchesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-grey">Recent</h2>
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
              onClick={() => onSelect(search.searchQuery, search.searchTab)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(search.id);
                }}
                disabled={isDeleting}
                className="p-2 text-grey hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove search"
              >
                <Image
                  src="/icons/close.svg"
                  alt="Remove"
                  width={16}
                  height={16}
                  className="opacity-40"
                />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
