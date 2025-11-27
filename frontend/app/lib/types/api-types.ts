// API Request and Response Types for LineUp Frontend

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
  yearOfBirth?: number;
  onboardingCompleted?: boolean;
  userType?: string;
  lookingFor?: string[];
}

// ==================== Looking For Types ====================

export type LookingForType =
  | "connect"
  | "promote"
  | "find-band"
  | "find-services";

// ==================== Error Response ====================

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
}
