"use client";

import { memo } from "react";
import type { TagSearchResult } from "../types";

interface TagSearchResultCardProps {
  tag: TagSearchResult;
}

function TagSearchResultCardComponent({ tag }: TagSearchResultCardProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <h3 className="font-semibold text-base text-gray-900">#{tag.name}</h3>
        <p className="text-sm text-grey mt-1">
          {tag.usageCount} {tag.usageCount === 1 ? "post" : "posts"}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-grey">
        <span className="capitalize">{tag.type}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M7.5 15L12.5 10L7.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export const TagSearchResultCard = memo(TagSearchResultCardComponent);
