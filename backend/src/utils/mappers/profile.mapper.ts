// src/utils/mappers/profile.mapper.ts
import { ProfileRow } from "../supabase-helpers.js";
import { UserProfile } from "../../types/api.types.js";

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
    avatarUrl: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    aboutMe: profile.about_me ?? undefined,
    location: profile.location,
    userType: profile.user_type,
    themeColor: profile.theme_color ?? undefined,
    spotifyPlaylistUrl: profile.spotify_playlist_url ?? undefined,
    onboardingCompleted: profile.onboarding_completed ?? false,
    createdAt: profile.created_at ?? new Date().toISOString(),
    updatedAt: profile.updated_at ?? new Date().toISOString(),
  };

  // Include private fields only for own profile
  if (includePrivateFields) {
    return {
      ...baseProfile,
      phoneCountryCode: profile.phone_country_code,
      phoneNumber: profile.phone_number,
      yearOfBirth: profile.year_of_birth,
    };
  }

  // Public profile (no phone, no yearOfBirth)
  return baseProfile;
}

