import type { SearchTab } from "./types";

/**
 * Tab order for carousel navigation and prefetching
 */
export const TAB_ORDER: SearchTab[] = [
  "for_you",
  "people",
  "collaborations",
  "services",
  "tags",
];

/**
 * Human-readable labels for each tab
 */
export const TAB_LABELS: Record<SearchTab, string> = {
  for_you: "For you",
  people: "People",
  collaborations: "Collaborations",
  services: "Services",
  tags: "Tags",
};
