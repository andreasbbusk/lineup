// API Request and Response Types for LineUp Frontend

// ==================== Auth Types ====================

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_country_code: number;
  phone_number: number;
  year_of_birth: number;
  location: string;
  user_type: "musician" | "service_provider" | "other";
}

export interface LoginRequest {
  email: string;
  password: string;
}

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

export interface SignupWithAuthRequest {
  email: string;
  password: string;
  username: string;
}

export interface AvailabilityResponse {
  available: boolean;
}

// ==================== Profile Types ====================

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  about_me?: string;
  phone_country_code?: number; // Only included for own profile
  phone_number?: number; // Only included for own profile
  year_of_birth?: number; // Only included for own profile
  location: string;
  user_type: string;
  theme_color?: string;
  spotify_playlist_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
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
  onboarding_completed?: boolean;
  user_type?: string;
  looking_for?: string[];
}

export interface CompleteProfileRequest {
  username: string;
  first_name: string;
  last_name: string;
  phone_country_code: number;
  phone_number: number;
  year_of_birth: number;
  location: string;
  user_type: "musician" | "service_provider" | "other";
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
