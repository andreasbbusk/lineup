// API Request and Response Types for LineUp Frontend
// Only truly shared types that are used across multiple features

// Re-export commonly used types from generated schema
export type { components, paths } from "./api";

// Frontend-only shared utility types
export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
