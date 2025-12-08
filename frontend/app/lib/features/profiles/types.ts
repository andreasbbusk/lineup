// Single source of truth: @/app/lib/types/api.d.ts
import type { components } from "@/app/lib/types/api";

// --- Backend API Types (from api.d.ts) ---
export type UserProfile = components["schemas"]["UserProfile"];
export type ProfileUpdateRequest = components["schemas"]["UpdateProfileDto"];
export type LookingForType = components["schemas"]["LookingForType"];

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
