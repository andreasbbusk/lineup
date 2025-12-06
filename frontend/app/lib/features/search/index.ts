/**
 * Search Feature (Infrastructure)
 *
 * This module provides core search infrastructure (API clients and generic hooks)
 * that can be used across the application.
 *
 * What belongs here:
 * - API clients (searchApi)
 * - Generic search hooks (useUserSearch, useSearchForYou, etc.)
 *
 * What does NOT belong here:
 * - UI components (those are feature-specific)
 * - Feature-specific logic (e.g., useConnections is chat-specific)
 */

// API
export { searchApi } from "./api";

// Hooks
export { useUserSearch } from "./hooks/useUserSearch";
