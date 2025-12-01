// Auth Types
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
  profile: {
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
    blocked_users?: string[];
    search_vector?: unknown;
  };
}

export interface SignupWithAuthRequest {
  email: string;
  password: string;
  username: string;
}

export interface AvailabilityResponse {
  available: boolean;
}
