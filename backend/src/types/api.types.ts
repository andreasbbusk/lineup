// API Request and Response Types for LineUp
// This file serves as the single source of truth for all API request/response contracts

// ==================== Profile Types ====================

/**
 * API response format for user profile
 *
 * @example
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "username": "johndoe",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "avatarUrl": "https://example.com/avatar.jpg",
 *   "bio": "Musician and producer",
 *   "location": "New York, NY",
 *   "userType": "musician",
 *   "onboardingCompleted": true,
 *   "createdAt": "2024-01-15T10:30:00Z"
 * }
 */
export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  aboutMe: string | null;
  phoneCountryCode?: number; // Only included for own profile
  phoneNumber?: number; // Only included for own profile
  yearOfBirth?: number; // Only included for own profile
  location: string;
  userType: string;
  themeColor: string | null;
  spotifyPlaylistUrl: string | null;
  onboardingCompleted: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ==================== Auth Types ====================

/**
 * API response format for authentication (signup/login)
 * Returns user information, session tokens, and profile data
 *
 * @example
 * {
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "email": "john@example.com",
 *     "createdAt": "2024-01-15T10:30:00Z"
 *   },
 *   "session": {
 *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "expiresIn": 3600,
 *     "expiresAt": 1705315800
 *   },
 *   "profile": { ... }
 * }
 */
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

/**
 * Request body for updating user profile
 * All fields are optional - only provided fields will be updated
 *
 * @example
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "bio": "Updated bio text",
 *   "location": "Los Angeles, CA",
 *   "themeColor": "#FF5733"
 * }
 */
export interface ProfileUpdateRequest {
  username?: string;
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
  yearOfBirth?: number;
  userType?: string;
  onboardingCompleted?: boolean;
  lookingFor?: string[];
}

// ==================== User Details Types ====================

/**
 * API response format for user social media links
 *
 * @example
 * {
 *   "userId": "user-123",
 *   "instagram": "johndoe",
 *   "twitter": "@johndoe",
 *   "youtube": "johndoechannel",
 *   "soundcloud": null,
 *   "facebook": null,
 *   "tiktok": null,
 *   "bandcamp": null
 * }
 */
export interface UserSocialMediaResponse {
  userId: string;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  youtube: string | null;
  soundcloud: string | null;
  tiktok: string | null;
  bandcamp: string | null;
}

/**
 * API response format for FAQ question
 *
 * @example
 * {
 *   "id": "q-456",
 *   "question": "What genres do you specialize in?",
 *   "displayOrder": 1,
 *   "isActive": true
 * }
 */
export interface FaqQuestionResponse {
  id: string;
  question: string;
  displayOrder: number;
  isActive: boolean;
}

/**
 * API response format for user FAQ answer with question
 *
 * @example
 * {
 *   "id": "faq-123",
 *   "questionId": "q-456",
 *   "question": "What genres do you specialize in?",
 *   "answer": "I specialize in electronic and ambient music",
 *   "createdAt": "2024-01-20T15:30:00Z"
 * }
 */
export interface UserFaqResponse {
  id: string;
  questionId: string;
  question: string;
  answer: string;
  createdAt: string | null;
}

/**
 * API response format for user's "looking for" preferences
 *
 * @example
 * {
 *   "userId": "user-123",
 *   "lookingForValue": "connect"
 * }
 */
export interface UserLookingForResponse {
  userId: string;
  lookingForValue: "connect" | "promote" | "find-band" | "find-services";
}

// ==================== Metadata Types ====================
/**
 * API response format for metadata item
 *
 * @example
 * {
 *   "id": "abc123",
 *   "type": "tag",
 *   "name": "indie-rock",
 *   "createdAt": "2024-01-15T10:30:00Z"
 * }
 */
export interface MetadataItem {
  id: string;
  type: "tag" | "genre" | "artist";
  name: string;
  createdAt: string | null;
}

/**
 * API response format for metadata endpoint
 * Returns all available tags, genres, and artists organized by type
 *
 * @example
 * {
 *   "tags": [
 *     { "id": "1", "type": "tag", "name": "indie", "createdAt": "2024-01-15T10:30:00Z" }
 *   ],
 *   "genres": [
 *     { "id": "2", "type": "genre", "name": "Rock", "createdAt": "2024-01-15T10:30:00Z" }
 *   ],
 *   "artists": [
 *     { "id": "3", "type": "artist", "name": "The Beatles", "createdAt": "2024-01-15T10:30:00Z" }
 *   ]
 * }
 */
export interface MetadataResponse {
  tags: MetadataItem[];
  genres: MetadataItem[];
  artists: MetadataItem[];
}

// ==================== Post Types ====================

/**
 * API response format for a post with flattened relations
 * This is the camelCase version of PostRow (database format)
 * The mapper transforms PostRow (snake_case) → PostResponse (camelCase)
 *
 * @example
 * {
 *   "id": "post-123",
 *   "type": "note",
 *   "title": "New Song Release",
 *   "description": "Check out my latest track!",
 *   "authorId": "user-123",
 *   "createdAt": "2024-01-20T15:30:00Z",
 *   "updatedAt": "2024-01-20T15:30:00Z",
 *   "location": "New York, NY",
 *   "paidOpportunity": false,
 *   "expiresAt": null,
 *   "metadata": [{ "id": "tag-1", "name": "indie", "type": "tag" }],
 *   "media": [{ "id": "media-1", "url": "https://...", "type": "image" }],
 *   "taggedUsers": [{ "id": "user-456", "username": "janedoe", ... }],
 *   "author": { "id": "user-123", "username": "johndoe", ... }
 * }
 */
export interface PostResponse {
  id: string;
  type: "note" | "request" | "story";
  title: string;
  description: string;
  authorId: string;
  createdAt: string | null;
  updatedAt: string | null;
  location: string | null;
  paidOpportunity: boolean | null;
  expiresAt: string | null;
  metadata?: Array<{
    id: string;
    name: string;
    type: "tag" | "genre" | "artist";
  }>;
  media?: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string | null;
    type: "image" | "video";
    displayOrder: number;
  }>;
  taggedUsers?: Array<{
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  }>;
  author?: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

/**
 * API response format for a post in the feed
 * Extends PostResponse with engagement data and user interaction state
 *
 * @example
 * {
 *   "id": "post-123",
 *   "title": "New Song Release",
 *   "likesCount": 42,
 *   "commentsCount": 8,
 *   "bookmarksCount": 15,
 *   "hasLiked": true,
 *   "hasBookmarked": false,
 *   ...
 * }
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
 *
 * @example
 * {
 *   "postId": "post-123",
 *   "userId": "user-456",
 *   "createdAt": "2024-01-20T15:30:00Z",
 *   "post": {
 *     "id": "post-123",
 *     "title": "New Song Release",
 *     "description": "Check it out!",
 *     "type": "note",
 *     "location": null,
 *     "createdAt": "2024-01-20T12:00:00Z",
 *     "author": {
 *       "id": "user-123",
 *       "username": "johndoe",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "avatarUrl": "https://..."
 *     }
 *   }
 * }
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

/**
 * Status of a connection request between two users
 */
export type ConnectionStatus = "pending" | "accepted" | "rejected";

/**
 * Types of connections users are looking for
 */
export type LookingForType =
  | "connect"
  | "promote"
  | "find-band"
  | "find-services";

/**
 * API response format for a connection request
 * Represents a connection request between two users with requester/recipient profiles
 *
 * @example
 * {
 *   "id": "conn-123",
 *   "requesterId": "user-123",
 *   "recipientId": "user-456",
 *   "status": "pending",
 *   "createdAt": "2024-01-20T15:30:00Z",
 *   "updatedAt": "2024-01-20T15:30:00Z",
 *   "requester": { "id": "user-123", "username": "johndoe", ... },
 *   "recipient": { "id": "user-456", "username": "janedoe", ... }
 * }
 */
export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  createdAt: string | null;
  updatedAt: string | null;
  requester?: UserProfile;
  recipient?: UserProfile;
}

// ==================== Collaboration Types ====================

/**
 * API response format for a user collaboration
 * Represents a past collaboration between two users
 *
 * @example
 * {
 *   "id": "collab-123",
 *   "userId": "user-123",
 *   "collaboratorId": "user-456",
 *   "description": "Worked together on album production",
 *   "createdAt": "2024-01-20T15:30:00Z",
 *   "collaborator": {
 *     "id": "user-456",
 *     "username": "janedoe",
 *     "firstName": "Jane",
 *     "lastName": "Doe",
 *     "avatarUrl": "https://..."
 *   }
 * }
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
 *
 * @example
 * {
 *   "id": "comment-123",
 *   "postId": "post-123",
 *   "authorId": "user-456",
 *   "content": "Great track! Love the production.",
 *   "createdAt": "2024-01-20T16:00:00Z",
 *   "updatedAt": "2024-01-20T16:00:00Z",
 *   "author": {
 *     "id": "user-456",
 *     "username": "janedoe",
 *     "firstName": "Jane",
 *     "lastName": "Doe",
 *     "avatarUrl": "https://..."
 *   }
 * }
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

/**
 * Query parameters for paginated endpoints
 * Uses cursor-based pagination for efficient large dataset retrieval
 *
 * @example
 * {
 *   "cursor": "2024-01-20T10:00:00Z",
 *   "limit": 20
 * }
 */
export interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

/**
 * Generic paginated response wrapper
 * @template T - The type of items in the data array
 *
 * @example
 * {
 *   "data": [{ "id": "1", ... }, { "id": "2", ... }],
 *   "pagination": {
 *     "nextCursor": "2024-01-19T10:00:00Z",
 *     "hasMore": true,
 *     "total": 100
 *   }
 * }
 */
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
 *
 * @example
 * {
 *   "userId": "user-123",
 *   "conversationId": "conv-456",
 *   "joinedAt": "2024-01-20T15:30:00Z",
 *   "leftAt": null,
 *   "isAdmin": false,
 *   "lastReadMessageId": "msg-789",
 *   "lastReadAt": "2024-01-20T16:00:00Z",
 *   "notificationsEnabled": true,
 *   "isMuted": false,
 *   "user": { "id": "user-123", "username": "johndoe", ... }
 * }
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
 *
 * @example
 * {
 *   "id": "conv-456",
 *   "type": "direct",
 *   "name": null,
 *   "avatarUrl": null,
 *   "createdBy": "user-123",
 *   "createdAt": "2024-01-20T15:30:00Z",
 *   "updatedAt": "2024-01-20T16:00:00Z",
 *   "lastMessageId": "msg-789",
 *   "lastMessagePreview": "Hey, want to collaborate?",
 *   "lastMessageAt": "2024-01-20T16:00:00Z",
 *   "creator": { "id": "user-123", "username": "johndoe", ... },
 *   "participants": [...]
 * }
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
  lastMessageSenderId?: string | null;
  unreadCount: number;
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
 *
 * @example
 * {
 *   "messageId": "msg-789",
 *   "userId": "user-456",
 *   "readAt": "2024-01-20T16:05:00Z",
 *   "user": {
 *     "id": "user-456",
 *     "username": "janedoe",
 *     "firstName": "Jane",
 *     "lastName": "Doe",
 *     "avatarUrl": "https://..."
 *   }
 * }
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
 *
 * @example
 * {
 *   "id": "msg-789",
 *   "conversationId": "conv-456",
 *   "senderId": "user-123",
 *   "content": "Hey, want to collaborate on a new track?",
 *   "mediaIds": null,
 *   "isEdited": false,
 *   "editedAt": null,
 *   "isDeleted": false,
 *   "deletedAt": null,
 *   "replyToMessageId": null,
 *   "createdAt": "2024-01-20T16:00:00Z",
 *   "sentViaWebsocket": false,
 *   "sender": { "id": "user-123", "username": "johndoe", ... },
 *   "replyTo": null,
 *   "readReceipts": [...],
 *   "media": []
 * }
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

/**
 * API response format for paginated messages
 * Used by GET /messages/:conversationId endpoint
 *
 * @example
 * {
 *   "messages": [...],
 *   "hasMore": true,
 *   "nextCursor": "msg-123"
 * }
 */
export interface PaginatedMessagesResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

// ==================== Notification Types ====================

/**
 * API response format for a notification
 * Represents a notification with actor information
 *
 * @example
 * {
 *   "id": "notif-123",
 *   "recipientId": "user-456",
 *   "actorId": "user-123",
 *   "type": "like",
 *   "entityType": "post",
 *   "entityId": "post-123",
 *   "title": "John Doe liked your post",
 *   "body": "New Song Release",
 *   "actionUrl": "/posts/post-123",
 *   "isRead": false,
 *   "isArchived": false,
 *   "createdAt": "2024-01-20T16:00:00Z",
 *   "readAt": null,
 *   "sentViaWebsocket": true,
 *   "actor": { "id": "user-123", "username": "johndoe", ... }
 * }
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

/**
 * API response format for grouped notifications
 * Returns notifications organized by type for easy filtering in the frontend
 * Uses Record type to ensure all notification types are included
 *
 * @example
 * {
 *   "like": [
 *     { "id": "notif-1", "type": "like", ... },
 *     { "id": "notif-2", "type": "like", ... }
 *   ],
 *   "comment": [
 *     { "id": "notif-3", "type": "comment", ... }
 *   ],
 *   "connection_request": [],
 *   "message": [...]
 * }
 */
export type GroupedNotificationsResponse = Record<
  | "like"
  | "comment"
  | "connection_request"
  | "connection_accepted"
  | "tagged_in_post"
  | "review"
  | "collaboration_request"
  | "message",
  NotificationResponse[]
>;

// ==================== Review Types ====================

/**
 * API response format for a user review
 * Represents a 5-star rating and review text for a user
 *
 * @example
 * {
 *   "id": "review-123",
 *   "userId": "user-456",
 *   "reviewerId": "user-123",
 *   "rating": 5,
 *   "description": "Excellent collaborator, very professional!",
 *   "createdAt": "2024-01-20T15:30:00Z",
 *   "reviewer": {
 *     "id": "user-123",
 *     "username": "johndoe",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "avatarUrl": "https://..."
 *   }
 * }
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
 *
 * @example
 * {
 *   "type": "user",
 *   "id": "user-123",
 *   "username": "johndoe",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "avatarUrl": "https://...",
 *   "bio": "Musician and producer",
 *   "location": "New York, NY",
 *   "genres": ["rock", "indie"],
 *   "lookingFor": ["connect", "find-band"],
 *   "isConnected": false,
 *   "relevance": 0.95
 * }
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
 *
 * @example
 * {
 *   "type": "collaboration",
 *   "id": "post-123",
 *   "title": "Looking for Drummer",
 *   "description": "Rock band seeking experienced drummer",
 *   "authorId": "user-456",
 *   "authorUsername": "janedoe",
 *   "authorAvatarUrl": "https://...",
 *   "location": "Los Angeles, CA",
 *   "paidOpportunity": true,
 *   "genres": ["rock", "alternative"],
 *   "createdAt": "2024-01-20T12:00:00Z",
 *   "relevance": 0.88
 * }
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
 *
 * @example
 * {
 *   "type": "tag",
 *   "id": "tag-123",
 *   "name": "indie-rock",
 *   "usageCount": 42,
 *   "relevance": 0.75
 * }
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
 *
 * @example
 * {
 *   "type": "for_you",
 *   "entityType": "user",
 *   "entityId": "user-123",
 *   "title": "John Doe",
 *   "subtitle": "Musician • New York, NY",
 *   "avatarUrl": "https://...",
 *   "matchReason": "Similar genres and location",
 *   "additionalInfo": { "genres": ["rock", "indie"] },
 *   "relevance": 0.92
 * }
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
 *
 * @example
 * {
 *   "results": [
 *     { "type": "user", "id": "user-123", ... },
 *     { "type": "collaboration", "id": "post-456", ... }
 *   ],
 *   "total": 25
 * }
 */
export interface SearchResponse {
  results: SearchResult[];
  total?: number;
}

// ==================== Upload Types ====================

/**
 * API response format for a single uploaded file
 *
 * @example
 * {
 *   "id": "media-123",
 *   "url": "https://storage.supabase.co/.../image.jpg",
 *   "thumbnailUrl": "https://storage.supabase.co/.../thumb.jpg",
 *   "type": "image",
 *   "createdAt": "2024-01-20T15:30:00Z"
 * }
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
 *
 * @example
 * {
 *   "files": [
 *     {
 *       "id": "media-123",
 *       "url": "https://storage.supabase.co/.../image1.jpg",
 *       "thumbnailUrl": null,
 *       "type": "image",
 *       "createdAt": "2024-01-20T15:30:00Z"
 *     },
 *     {
 *       "id": "media-124",
 *       "url": "https://storage.supabase.co/.../image2.jpg",
 *       "thumbnailUrl": null,
 *       "type": "image",
 *       "createdAt": "2024-01-20T15:30:00Z"
 *     }
 *   ]
 * }
 */
export interface UploadResponse {
  files: UploadedFileResponse[];
}

/**
 * API response format for signed upload URL
 *
 * Returns a temporary signed URL that allows direct client uploads to Supabase Storage.
 * The client uses this URL to upload files directly, bypassing the backend.
 *
 * @example
 * {
 *   "signedUrl": "https://[project].supabase.co/storage/v1/object/sign/posts/user-123/file.jpg?...",
 *   "filePath": "posts/user-123/1234567890-abc123.jpg"
 * }
 */
export interface SignedUrlResponse {
  signedUrl: string;
  filePath: string;
}

// ==================== Error Response ====================

/**
 * Standard error response format for all API errors
 * Returned when an error occurs in any endpoint
 *
 * @example
 * {
 *   "error": "User not found",
 *   "code": "NOT_FOUND",
 *   "details": null,
 *   "timestamp": "2024-01-20T16:00:00Z"
 * }
 */
export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
