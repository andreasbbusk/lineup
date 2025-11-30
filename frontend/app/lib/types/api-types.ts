// API Request and Response Types for LineUp Frontend

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
  phone_country_code?: number;
  phone_number?: number;
  year_of_birth?: number;
  location: string;
  user_type: string;
  theme_color?: string;
  spotify_playlist_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  blocked_users?: string[]; // Array of UUIDs
  search_vector?: unknown;  // tsvector from Postgres (usually ignored in frontend)
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

// ==================== Onboarding Types ====================

export interface OnboardingData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_country_code: string;
  phone_number: string;
  year_of_birth: number;
  location: string;
  user_type: "musician" | "service_provider" | "other";
  looking_for: string[];
  account_created?: boolean;
}

// Combined store interface
export interface AppStore {
  // Auth state
  user: { id: string; email: string } | null;
  access_token: string | null;
  profile: UserProfile | null;
  is_authenticated: boolean;

  // Onboarding state
  onboarding: {
    step: number;
    data: Partial<OnboardingData>;
  };

  // Auth actions
  set_auth: (
    user: { id: string; email: string },
    access_token: string,
    profile: UserProfile | null
  ) => void;
  clear_auth: () => void;
  update_profile: (profile: UserProfile) => void;

  // Onboarding actions
  next_step: () => void;
  prev_step: () => void;
  go_to_step: (step: number) => void;
  update_onboarding_data: (partial: Partial<OnboardingData>) => void;
  reset_onboarding: () => void;
  mark_account_created: () => void;
}