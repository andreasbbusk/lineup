// API Request and Response Types for LineUp

import { ProfileRow } from "../utils/supabase-helpers.js";

// ==================== Profile Types ====================

// UserProfile is now exactly the same as the database row
// This ensures the API type is always perfectly in sync with the database schema
export type UserProfile = ProfileRow;

// ==================== Auth Types ====================

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  };
  profile: UserProfile;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  bio?: string;
  about_me?: string;
  avatar_url?: string;
  location?: string;
  theme_color?: string;
  spotify_playlist_url?: string;
  phone_country_code?: number;
  phone_number?: number;
  year_of_birth?: number;
  user_type?: string;
  onboarding_completed?: boolean;
  looking_for?: string[];
}

// ==================== Metadata Types ====================
export interface MetadataItem {
  id: string;
  type: "tag" | "genre" | "artist";
  name: string;
  created_at: string;
}

export interface MetadataResponse {
  tags: MetadataItem[];
  genres: MetadataItem[];
  artists: MetadataItem[];
}

// ==================== Connection Types ====================

export type ConnectionStatus = "pending" | "accepted" | "rejected";
export type LookingForType =
  | "connect"
  | "promote"
  | "find-band"
  | "find-services";

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  requester?: UserProfile;
  recipient?: UserProfile;
}

// ==================== Pagination ====================

export interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    next_cursor?: string;
    has_more: boolean;
    total?: number;
  };
}

// ==================== Error Response ====================

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
