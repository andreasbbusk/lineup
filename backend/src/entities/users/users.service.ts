// src/entities/users/users.service.ts
import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { UserProfile } from "../../types/api.types.js";
import { createHttpError } from "../../utils/error-handler.js";
import { ProfileRow, ProfileUpdate } from "../../utils/supabase-helpers.js";
import { UpdateProfileDto } from "./users.dto.js";
import { mapProfileToAPI } from "./users.mapper.js";

export class UsersService {
  /**
   * Get user profile by username
   * Returns public profile by default. If authenticated and viewing own profile, returns private fields.
   * @param username Username to fetch
   * @param authenticatedUserId Optional ID of the currently authenticated user
   */
  async getUserByUsername(
    username: string,
    authenticatedUserId?: string
  ): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !profile) {
      throw createHttpError({
        message: "User not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    const isOwnProfile = authenticatedUserId === profile.id;

    // Use mapper to convert database format to API format
    return mapProfileToAPI(profile as ProfileRow, isOwnProfile);
  }

  /**
   * Update user profile (also handles initial profile creation)
   * Only the profile owner can update their own profile
   * @param username Username of profile to update
   * @param userId ID of the authenticated user (from JWT)
   * @param data Data to update (or create initial profile)
   * @param token Bearer token for RLS bypass
   */
  async updateProfile(
    username: string,
    userId: string,
    data: UpdateProfileDto,
    token: string
  ): Promise<UserProfile> {
    // Create authenticated Supabase client with user's token
    const authedSupabase = createAuthenticatedClient(token);

    // Check if profile exists (use maybeSingle - doesn't throw if not found)
    const { data: profile, error: fetchError } = await authedSupabase
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .maybeSingle();

    // For updates: verify ownership
    if (profile && profile.id !== userId) {
      throw createHttpError({
        message: "You can only update your own profile",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // For creation: username in path must match data or be the user's ID
    if (!profile && username !== userId) {
      throw createHttpError({
        message: "Username mismatch during profile creation",
        statusCode: 400,
        code: "BAD_REQUEST",
      });
    }

    // Separate lookingFor (relational data) from profile fields
    const { lookingFor, ...profileData } = data;

    // Build update/insert data - convert camelCase to snake_case
    // Only include defined fields
    const updateData: ProfileUpdate = {
      id: userId, // Ensure ID is set for upsert
    };

    if (profileData.username !== undefined)
      updateData.username = profileData.username;
    if (profileData.firstName !== undefined)
      updateData.first_name = profileData.firstName;
    if (profileData.lastName !== undefined)
      updateData.last_name = profileData.lastName;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;
    if (profileData.aboutMe !== undefined)
      updateData.about_me = profileData.aboutMe;
    if (profileData.avatarUrl !== undefined)
      updateData.avatar_url = profileData.avatarUrl;
    if (profileData.location !== undefined)
      updateData.location = profileData.location;
    if (profileData.themeColor !== undefined)
      updateData.theme_color = profileData.themeColor;
    if (profileData.spotifyPlaylistUrl !== undefined)
      updateData.spotify_playlist_url = profileData.spotifyPlaylistUrl;
    if (profileData.phoneCountryCode !== undefined)
      updateData.phone_country_code = profileData.phoneCountryCode;
    if (profileData.phoneNumber !== undefined)
      updateData.phone_number = profileData.phoneNumber;
    if (profileData.yearOfBirth !== undefined)
      updateData.year_of_birth = profileData.yearOfBirth;
    if (profileData.userType !== undefined)
      updateData.user_type = profileData.userType;
    if (profileData.onboardingCompleted !== undefined)
      updateData.onboarding_completed = profileData.onboardingCompleted;

    // Handle lookingFor updates (if provided)
    if (lookingFor !== undefined) {
      // Delete existing preferences
      const { error: deleteError } = await authedSupabase
        .from("user_looking_for")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        throw createHttpError({
          message: "Failed to update looking for preferences",
          statusCode: 500,
          code: "DATABASE_ERROR",
          details: deleteError,
        });
      }

      // Insert new preferences
      if (lookingFor.length > 0) {
        const lookingForRecords = lookingFor.map((item: string) => ({
          user_id: userId,
          looking_for_value: item as
            | "connect"
            | "promote"
            | "find-band"
            | "find-services",
        }));

        const { error: insertError } = await authedSupabase
          .from("user_looking_for")
          .insert(lookingForRecords);

        if (insertError) {
          throw createHttpError({
            message: "Failed to insert looking for preferences",
            statusCode: 500,
            code: "DATABASE_ERROR",
            details: insertError,
          });
        }
      }

      // Mark onboarding complete if not explicitly set
      if (profileData.onboardingCompleted === undefined) {
        updateData.onboarding_completed = true;
      }
    }

    // Upsert profile (insert if new, update if exists)
    const { data: updatedProfile, error: updateError } = await authedSupabase
      .from("profiles")
      .upsert(updateData as any, { onConflict: "id" })
      .select()
      .single();

    if (updateError || !updatedProfile) {
      throw createHttpError({
        message: profile
          ? "Failed to update profile"
          : "Failed to create profile",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: updateError,
      });
    }

    return mapProfileToAPI(updatedProfile as ProfileRow);
  }
}
