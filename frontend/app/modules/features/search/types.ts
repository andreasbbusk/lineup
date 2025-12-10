// Single source of truth: @/app/modules/types/api.d.ts
import type { components } from "@/app/modules/types/api";

// --- Entity Types (from api.d.ts) ---
export type SearchResult = components["schemas"]["SearchResult"];
export type SearchResponse = components["schemas"]["SearchResponse"];
export type UserSearchResult = components["schemas"]["UserSearchResult"];
export type CollaborationSearchResult =
  components["schemas"]["CollaborationSearchResult"];
export type ServiceSearchResult = components["schemas"]["ServiceSearchResult"];
export type TagSearchResult = components["schemas"]["TagSearchResult"];
export type ForYouSearchResult = components["schemas"]["ForYouSearchResult"];
export type RecentSearch = components["schemas"]["RecentSearch"];
export type SaveRecentSearchDto = components["schemas"]["SaveRecentSearchDto"];

// --- Frontend-only UI Types ---
export type SearchTab =
  | "for_you"
  | "people"
  | "collaborations"
  | "services"
  | "tags";

export type SearchState = {
  query: string;
  activeTab: SearchTab;
  isLoading: boolean;
  results: SearchResult[];
  recentSearches: RecentSearch[];
  error: string | null;
};

export type SearchQueryParams = {
  q?: string;
  tab: SearchTab;
  limit?: number;
  offset?: number;
  location?: string;
  genres?: string[];
  lookingFor?: string[];
  paidOnly?: boolean;
};
