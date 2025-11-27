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

/**
 * API response format for a post in the feed
 * Extends PostResponse with engagement data and user interaction state
 */
export interface FeedPostResponse extends PostResponse {
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
}

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

// ==================== Conversation Types ====================

/**
 * API response format for a conversation participant
 */
export interface ConversationParticipantResponse {
  userId: string;
  conversationId: string;
  joinedAt: string | null;
  leftAt?: string | null;
  isAdmin: boolean | null;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
  notificationsEnabled: boolean | null;
  isMuted: boolean | null;
  user?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

/**
 * API response format for a conversation
 * Represents a direct message or group conversation
 */
export interface ConversationResponse {
  id: string;
  type: "direct" | "group";
  name?: string | null;
  avatarUrl?: string | null;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
  lastMessageId?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  creator?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
  participants?: ConversationParticipantResponse[];
}

// ==================== Message Types ====================

/**
 * API response format for a message read receipt
 */
export interface MessageReadReceiptResponse {
  messageId: string;
  userId: string;
  readAt: string | null;
  user?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

/**
 * API response format for a message
 * Represents a message in a conversation with sender info and optional reply
 */
export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  mediaIds?: string[] | null;
  isEdited: boolean | null;
  editedAt?: string | null;
  isDeleted: boolean | null;
  deletedAt?: string | null;
  replyToMessageId?: string | null;
  createdAt: string | null;
  sentViaWebsocket: boolean | null;
  sender?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
  replyTo?: MessageResponse | null;
  readReceipts?: MessageReadReceiptResponse[];
  media?: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string | null;
    type: string;
  }>;
}

// ==================== Notification Types ====================

/**
 * API response format for a notification
 * Represents a notification with actor information
 */
export interface NotificationResponse {
  id: string;
  recipientId: string;
  actorId?: string | null;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  title: string;
  body?: string | null;
  actionUrl?: string | null;
  isRead: boolean | null;
  isArchived: boolean | null;
  createdAt: string | null;
  readAt?: string | null;
  sentViaWebsocket: boolean | null;
  actor?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

// ==================== Review Types ====================

/**
 * API response format for a user review
 * Represents a 5-star rating and review text for a user
 */
export interface ReviewResponse {
  id: string;
  userId: string;
  reviewerId: string;
  rating: number;
  description?: string | null;
  createdAt: string | null;
  reviewer?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

// ==================== Search Types ====================

/**
 * Search result for a user (from search_people)
 */
export interface UserSearchResult {
  type: "user";
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  genres?: any;
  lookingFor?: string[];
  isConnected: boolean;
  relevance: number;
}

/**
 * Search result for a collaboration request (from search_collaborations)
 */
export interface CollaborationSearchResult {
  type: "collaboration";
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string | null;
  location?: string | null;
  paidOpportunity: boolean;
  genres?: any;
  createdAt: string;
  relevance: number;
}

/**
 * Search result for metadata/tags (from search_tags)
 */
export interface TagSearchResult {
  type: "tag" | "genre" | "artist";
  id: string;
  name: string;
  usageCount: number;
  relevance: number;
}

/**
 * Search result for "For You" tab (from search_for_you)
 * Polymorphic result that can be a user or collaboration
 */
export interface ForYouSearchResult {
  type: "for_you";
  entityType: "user" | "collaboration";
  entityId: string;
  title: string;
  subtitle: string;
  avatarUrl?: string | null;
  matchReason: string;
  additionalInfo?: any;
  relevance: number;
}

/**
 * Union type for all search results
 */
export type SearchResult =
  | UserSearchResult
  | CollaborationSearchResult
  | TagSearchResult
  | ForYouSearchResult;

/**
 * API response format for search results
 */
export interface SearchResponse {
  results: SearchResult[];
  total?: number;
}

// ==================== Upload Types ====================

/**
 * API response format for a single uploaded file
 */
export interface UploadedFileResponse {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  type: "image" | "video";
  createdAt: string | null;
}

/**
 * API response format for batch file upload
 */
export interface UploadResponse {
  files: UploadedFileResponse[];
}

// ==================== Error Response ====================

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
