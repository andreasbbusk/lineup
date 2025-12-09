// Single source of truth: @/app/lib/types/api.d.ts
import type { components } from "@/app/modules/types/api";

// --- Backend API Types (from api.d.ts) ---
export type UserProfile = components["schemas"]["UserProfile"];
export type ProfileUpdateRequest = components["schemas"]["UpdateProfileDto"];
export type LookingForType = components["schemas"]["LookingForType"];
export type ConnectionStatus = components["schemas"]["ConnectionStatus"];
export type Connection = components["schemas"]["Connection"];
export type CollaborationResponse =
  components["schemas"]["CollaborationResponse"];
export type ReviewResponse = components["schemas"]["ReviewResponse"];
export type UserSocialMediaResponse =
  components["schemas"]["UserSocialMediaResponse"];
export type UserFaqResponse = components["schemas"]["UserFaqResponse"];
export type FaqQuestionResponse = components["schemas"]["FaqQuestionResponse"];
export type UserLookingForResponse =
  components["schemas"]["UserLookingForResponse"];

// --- Frontend-only Types ---
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
  lookingFor: LookingForType[];
  accountCreated?: boolean;
}
