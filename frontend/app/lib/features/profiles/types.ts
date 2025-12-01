// Profile Types
export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  about_me?: string;
  phone_country_code?: string;
  phone_number?: string;
  year_of_birth?: number;
  location: string;
  user_type: string;
  theme_color?: string;
  spotify_playlist_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  blocked_users?: string[];
  search_vector?: unknown;
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
  phone_country_code?: string;
  phone_number?: string;
  year_of_birth?: number;
  onboarding_completed?: boolean;
  user_type?: string;
  looking_for?: string[];
}

export type LookingForType =
  | "connect"
  | "promote"
  | "find-band"
  | "find-services";

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
