import type { UserProfile } from "@/app/lib/types/api-types";

export function mapDatabaseProfile(data: any): UserProfile {
  return {
    id: data.id,
    username: data.username,
    firstName: data.first_name,
    lastName: data.last_name,
    location: data.location,
    userType: data.user_type,
    phoneCountryCode: data.phone_country_code,
    phoneNumber: data.phone_number,
    yearOfBirth: data.year_of_birth,
    onboardingCompleted: data.onboarding_completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    aboutMe: data.about_me,
    themeColor: data.theme_color,
    spotifyPlaylistUrl: data.spotify_playlist_url,
  };
}
