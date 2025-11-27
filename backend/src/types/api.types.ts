// API Request and Response Types for LineUp
// This file serves as the single source of truth for all API request/response contracts

import { PostRow } from "../utils/supabase-helpers.js";

// ==================== Auth Types ====================

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
  };
  profile: UserProfile;
}

// ==================== Profile Types ====================

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  aboutMe?: string;
  phoneCountryCode?: number; // Only included for own profile
  phoneNumber?: number; // Only included for own profile
  yearOfBirth?: number; // Only included for own profile
  location: string;
  userType: string;
  themeColor?: string;
  spotifyPlaylistUrl?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  aboutMe?: string;
  avatarUrl?: string;
  location?: string;
  themeColor?: string;
  spotifyPlaylistUrl?: string;
  phoneCountryCode?: number;
  phoneNumber?: number;
  onboardingCompleted?: boolean;
}

// ==================== Metadata Types ====================
export interface MetadataItem {
  id: string;
  type: "tag" | "genre" | "artist";
  name: string;
  createdAt: string;
}

export interface MetadataResponse {
  tags: MetadataItem[];
  genres: MetadataItem[];
  artists: MetadataItem[];
}

// ==================== Post Types ====================

/**
 * API response format for a post with flattened relations
 * Based on PostRow with additional flattened metadata, media, tagged_users, and author
 */
export type PostResponse = PostRow & {
  metadata?: any[];
  media?: any[];
  tagged_users?: any[];
  author?: any;
};

// ==================== Bookmark Types ====================

/**
 * API response format for a bookmark
 * Includes the bookmark details and optional post information with author
 */
export interface BookmarkResponse {
  postId: string;
  userId: string;
  createdAt: string | null;
  post?: {
    id: string;
    title: string;
    description: string;
    type: string;
    location: string | null;
    createdAt: string | null;
    author?: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  };
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
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  requester?: UserProfile;
  recipient?: UserProfile;
}

// ==================== Collaboration Types ====================

/**
 * API response format for a user collaboration
 * Represents a past collaboration between two users
 */
export interface CollaborationResponse {
  id: string;
  userId: string;
  collaboratorId: string;
  description?: string | null;
  createdAt: string | null;
  collaborator?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

// ==================== Comment Types ====================

/**
 * API response format for a comment
 * Represents a comment on a post with author information
 */
export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  author?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

// ==================== Pagination ====================

export interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
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
