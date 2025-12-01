// Re-export backend API types from api.ts for convenience
export type { AuthResponse } from "./api";

// Frontend-only types (not in backend API)
export type { SignupWithAuthRequest } from "./api";
