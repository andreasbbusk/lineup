// Re-export backend API types from api.ts for convenience
export type { UserProfile, ProfileUpdateRequest } from "./api";

// Frontend-only types (not in backend API)

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
