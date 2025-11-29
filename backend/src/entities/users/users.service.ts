// src/entities/users/users.service.ts
import { createClient } from "@supabase/supabase-js";
import {
  supabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "../../config/supabase.ts";
import { ProfileRow, ProfileUpdate } from "../../utils/supabase-helpers.ts";
import { mapProfileToAPI } from "../../utils/mappers/index.ts";
import { UserProfile } from "../../types/api.types.js";
import { UpdateProfileDto } from "./users.dto.js";
import { createHttpError } from "../../utils/error-handler.ts";
import { Database } from "../../types/supabase.ts";

export class UsersService {
  /**
   * Get user profile by username
   * Returns public profile by default. If authenticated and viewing own profile, returns private fields.
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

    // Include private fields only if viewing own profile
    const isOwnProfile = authenticatedUserId === profile.id;
    return mapProfileToAPI(profile as ProfileRow, isOwnProfile);
  }

  /**
   * Update user profile
   * Only the profile owner can update their own profile
   */
  async updateProfile(
    username: string,
    userId: string,
    data: UpdateProfileDto,
    token: string
  ): Promise<UserProfile> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Verify the username belongs to the authenticated user
    const { data: profile, error: fetchError } = await authedSupabase
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .single();

    if (fetchError || !profile) {
      throw createHttpError({
        message: "User not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (profile.id !== userId) {
      throw createHttpError({
        message: "You can only update your own profile",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Map API format (camelCase) to database format (snake_case)
    const updateData: ProfileUpdate = {};
    if (data.firstName !== undefined) {
      updateData.first_name = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.last_name = data.lastName;
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }
    if (data.aboutMe !== undefined) {
      updateData.about_me = data.aboutMe;
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatar_url = data.avatarUrl;
    }
    if (data.location !== undefined) {
      updateData.location = data.location;
    }
    if (data.themeColor !== undefined) {
      updateData.theme_color = data.themeColor;
    }
    if (data.spotifyPlaylistUrl !== undefined) {
      updateData.spotify_playlist_url = data.spotifyPlaylistUrl;
    }
    if (data.phoneCountryCode !== undefined) {
      updateData.phone_country_code = data.phoneCountryCode;
    }
    if (data.phoneNumber !== undefined) {
      updateData.phone_number = data.phoneNumber;
    }
    if (data.yearOfBirth !== undefined) {
      updateData.year_of_birth = data.yearOfBirth;
    }
    if (data.userType !== undefined) {
      updateData.user_type = data.userType as "musician" | "service_provider" | "other";
    }
    if (data.onboardingCompleted !== undefined) {
      updateData.onboarding_completed = data.onboardingCompleted;
    }

    // Handle lookingFor data if provided
    if (data.lookingFor !== undefined) {
      // Delete existing looking_for records
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

      // Insert new looking_for records if array is not empty
      if (data.lookingFor.length > 0) {
        const lookingForRecords = data.lookingFor.map((item) => ({
          user_id: userId,
          looking_for_value: item as "connect" | "promote" | "find-band" | "find-services",
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

      // Set onboarding_completed to true if not already set
      if (data.onboardingCompleted === undefined) {
        updateData.onboarding_completed = true;
      }
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await authedSupabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      throw createHttpError({
        message: "Failed to update profile",
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapProfileToAPI(updatedProfile as ProfileRow);
  }
}
