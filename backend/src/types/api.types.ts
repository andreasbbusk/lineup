// API Request and Response Types for LineUp

// ==================== Auth Types ====================

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneCountryCode: number;
  phoneNumber: number;
  yearOfBirth: number;
  location: string;
  userType: "musician" | "service_provider" | "other";
}

export interface LoginRequest {
  email: string;
  password: string;
}

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
