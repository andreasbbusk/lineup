// ============================================================================
// Types
// ============================================================================

export type {
  SearchResult,
  SearchResponse,
  UserSearchResult,
  CollaborationSearchResult,
  ServiceSearchResult,
  TagSearchResult,
  ForYouSearchResult,
  RecentSearch,
  SaveRecentSearchDto,
  SearchTab,
  SearchState,
  SearchQueryParams,
} from "./types";

// ============================================================================
// Components
// ============================================================================

export { SearchBar } from "./components/search-bar";
export { SearchTabs } from "./components/search-tabs";
export { RecentSearches } from "./components/recent-searches";

// ============================================================================
// Hooks
// ============================================================================

export {
  useRecentSearches,
  useSaveRecentSearch,
  useDeleteRecentSearch,
  useClearRecentSearches,
} from "./hooks/useRecentSearches";
