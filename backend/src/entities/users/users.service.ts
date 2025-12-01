// src/entities/users/users.service.ts
import {
  supabase,
  createAuthenticatedClient,
} from "../../config/supabase.config.js";
import { ProfileRow, ProfileUpdate } from "../../utils/supabase-helpers.ts";
import { mapProfileToAPI } from "./users.mapper.js";
import { UserProfile } from "../../types/api.types.js";
import { Database } from "../../types/supabase.js";
import { createHttpError } from "../../utils/error-handler.js";
import { ProfileUpdate } from "../../utils/supabase-helpers.js";
import { UpdateProfileDto } from "./users.dto.js";
import { createHttpError } from "../../utils/error-handler.ts";

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

    if (!isOwnProfile) {
      // Strip private sensitive info for public viewing
      const publicProfile = { ...profile };
      // TypeScript cast to 'any' to delete optional properties
      delete (publicProfile as any).phone_number;
      delete (publicProfile as any).phone_country_code;
      delete (publicProfile as any).year_of_birth;
      return publicProfile as UserProfile;
    }

    return profile as UserProfile;
  }

  /**
   * Update user profile
   * Only the profile owner can update their own profile
   * @param username Username of profile to update
   * @param userId ID of the authenticated user
   * @param data Data to update
   * @param token Bearer token for RLS
   */
  async updateProfile(
    username: string,
    userId: string,
    data: UpdateProfileDto,
    token: string
  ): Promise<UserProfile> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

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

    // Separate looking_for (relational data) from profile fields
    const { looking_for, ...profileData } = data;

    // Direct assignment since types match (excluding looking_for)
    const updateData: ProfileUpdate = profileData as ProfileUpdate;

    // Handle looking_for updates
    if (looking_for !== undefined) {
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

      if (looking_for.length > 0) {
        const lookingForRecords = looking_for.map((item) => ({
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

      if (profileData.onboarding_completed === undefined) {
        updateData.onboarding_completed = true;
      }
    }

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

    return updatedProfile as UserProfile;
  }
}
