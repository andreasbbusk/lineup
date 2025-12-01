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
  firstName: string;
  lastName: string;
  phoneCountryCode: number;
  phoneNumber: number;
  yearOfBirth: number;
  location: string;
  userType: "musician" | "service_provider" | "other";
  lookingFor: string[];
  accountCreated?: boolean;
}
