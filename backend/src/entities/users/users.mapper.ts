// src/entities/users/users.mapper.ts
import { ProfileRow } from "../../utils/supabase-helpers.js";
import { UserProfile, BlockedUserResponse } from "../../types/api.types.js";

/**
 * Maps database profile (snake_case) to API profile format (camelCase)
 * @param profile - Database profile object
 * @param includePrivateFields - Whether to include phone/email/yearOfBirth (default: true)
 */
export function mapProfileToAPI(
  profile: ProfileRow,
  includePrivateFields: boolean = true
): UserProfile {
  const baseProfile: UserProfile = {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
    aboutMe: profile.about_me ?? null,
    location: profile.location,
    userType: profile.user_type,
    themeColor: profile.theme_color ?? null,
    spotifyPlaylistUrl: profile.spotify_playlist_url ?? null,
    onboardingCompleted: profile.onboarding_completed ?? false,
    createdAt: profile.created_at ?? null,
    updatedAt: profile.updated_at ?? null,
  };

  // Include private fields only for own profile
  if (includePrivateFields) {
    return {
      ...baseProfile,
      phoneCountryCode: profile.phone_country_code ?? undefined,
      phoneNumber: profile.phone_number ?? undefined,
      yearOfBirth: profile.year_of_birth,
    };
  }

  // Public profile (no phone, no yearOfBirth)
  return baseProfile;
}

/**
 * Maps database profile to blocked user response format
 * @param user - Database profile object
 */
export function mapBlockedUserToResponse(user: any): BlockedUserResponse {
  return {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    avatarUrl: user.avatar_url ?? null,
  };
}

/**
 * Maps array of database profiles to blocked users response format
 * @param users - Array of database profile objects
 */
export function mapBlockedUsersToResponse(users: any[]): BlockedUserResponse[] {
  return users.map(mapBlockedUserToResponse);
}
