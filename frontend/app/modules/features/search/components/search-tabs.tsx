"use client";

import type { SearchTab } from "../types";

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
}

const TAB_LABELS: Record<SearchTab, string> = {
  for_you: "For you",
  people: "People",
  collaborations: "Collaborations",
  services: "Services",
  tags: "Tags",
};

const TABS: SearchTab[] = [
  "for_you",
  "people",
  "collaborations",
  "services",
  "tags",
];

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 min-w-max">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-base font-medium transition-colors whitespace-nowrap pb-1 ${
              activeTab === tab
                ? "text-white border-b-2 border-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>
    </div>
  );
}
