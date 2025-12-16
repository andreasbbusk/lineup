// src/entities/users/users.service.ts
import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import {
  UserProfile,
  BlockedUserResponse,
  BlockStatusResponse,
} from "../../types/api.types.js";
import { createHttpError } from "../../utils/error-handler.js";
import { ProfileRow, ProfileUpdate } from "../../utils/supabase-helpers.js";
import { UpdateProfileDto } from "./users.dto.js";
import { mapProfileToAPI, mapBlockedUsersToResponse } from "./users.mapper.js";

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
    const trimmedUsername = username.trim();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .filter("username", "ilike", trimmedUsername)
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
   * Update user profile
   * Only the profile owner can update their own profile
   * @param username Username of profile to update
   * @param userId ID of the authenticated user (from JWT)
   * @param data Data to update
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

    // Check if profile exists - use case-insensitive matching
    const trimmedUsername = username.trim();
    const { data: profile, error: fetchError } = await authedSupabase
      .from("profiles")
      .select("id, username")
      .filter("username", "ilike", trimmedUsername)
      .single();

    if (fetchError || !profile) {
      throw createHttpError({
        message: "User not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Verify ownership - user can only update their own profile
    if (profile.id !== userId) {
      throw createHttpError({
        message: "You can only update your own profile",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Separate lookingFor (relational data) from profile fields
    const { lookingFor, ...profileData } = data;

    // Build update data - convert camelCase to snake_case
    // Only include defined fields
    const updateData: ProfileUpdate = {};

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

    // Update profile (not upsert - this is an update endpoint)
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
        details: updateError,
      });
    }

    return mapProfileToAPI(updatedProfile as ProfileRow);
  }

  /**
   * Block a user
   * Adds the blocked user's ID to the blocker's blocked_users array and removes direct conversations
   * @param blockerId ID of the user doing the blocking
   * @param blockedId ID of the user being blocked
   * @param token Bearer token for authenticated Supabase client
   */
  async blockUser(
    blockerId: string,
    blockedId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Prevent self-blocking
    if (blockerId === blockedId) {
      throw createHttpError({
        message: "Cannot block yourself",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Verify target user exists
    const { data: targetUser, error: targetError } = await authedSupabase
      .from("profiles")
      .select("id")
      .eq("id", blockedId)
      .single();

    if (targetError || !targetUser) {
      throw createHttpError({
        message: "User not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Get current blocker's profile
    const { data: blockerProfile, error: blockerError } = await authedSupabase
      .from("profiles")
      .select("id, blocked_users")
      .eq("id", blockerId)
      .single();

    if (blockerError || !blockerProfile) {
      throw createHttpError({
        message: "Failed to fetch blocker profile",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: blockerError,
      });
    }

    // Check if already blocked
    const currentBlocked = blockerProfile.blocked_users || [];
    if (currentBlocked.includes(blockedId)) {
      throw createHttpError({
        message: "User is already blocked",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Add blocked user to array
    const updatedBlocked = [...currentBlocked, blockedId];

    // Update blocker's profile
    const { error: updateError } = await authedSupabase
      .from("profiles")
      .update({ blocked_users: updatedBlocked })
      .eq("id", blockerId);

    if (updateError) {
      throw createHttpError({
        message: "Failed to block user",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: updateError,
      });
    }

    // Remove direct conversations between the two users
    await this.removeDirectConversations(blockerId, blockedId, authedSupabase);
  }

  /**
   * Unblock a user
   * Removes the blocked user's ID from the blocker's blocked_users array
   * @param blockerId ID of the user doing the unblocking
   * @param blockedId ID of the user being unblocked
   * @param token Bearer token for authenticated Supabase client
   */
  async unblockUser(
    blockerId: string,
    blockedId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Get current blocker's profile
    const { data: blockerProfile, error: blockerError } = await authedSupabase
      .from("profiles")
      .select("id, blocked_users")
      .eq("id", blockerId)
      .single();

    if (blockerError || !blockerProfile) {
      throw createHttpError({
        message: "Failed to fetch blocker profile",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: blockerError,
      });
    }

    // Check if user is blocked
    const currentBlocked = blockerProfile.blocked_users || [];
    if (!currentBlocked.includes(blockedId)) {
      throw createHttpError({
        message: "User is not blocked",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Remove blocked user from array
    const updatedBlocked = currentBlocked.filter(
      (id: string) => id !== blockedId
    );

    // Update blocker's profile
    const { error: updateError } = await authedSupabase
      .from("profiles")
      .update({ blocked_users: updatedBlocked })
      .eq("id", blockerId);

    if (updateError) {
      throw createHttpError({
        message: "Failed to unblock user",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: updateError,
      });
    }
  }

  /**
   * Check block status between two users
   * Returns whether the users are blocked and in which direction
   * @param userId ID of the first user
   * @param targetId ID of the second user
   * @param token Bearer token for authenticated Supabase client
   */
  async isBlocked(
    userId: string,
    targetId: string,
    token: string
  ): Promise<BlockStatusResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Get both users' profiles
    const { data: profiles, error: profilesError } = await authedSupabase
      .from("profiles")
      .select("id, blocked_users")
      .in("id", [userId, targetId]);

    if (profilesError || !profiles || profiles.length !== 2) {
      throw createHttpError({
        message: "Failed to fetch user profiles",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: profilesError,
      });
    }

    const userProfile = profiles.find((p) => p.id === userId);
    const targetProfile = profiles.find((p) => p.id === targetId);

    if (!userProfile || !targetProfile) {
      throw createHttpError({
        message: "User not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    const userBlocked = userProfile.blocked_users || [];
    const targetBlocked = targetProfile.blocked_users || [];

    const userBlockedTarget = userBlocked.includes(targetId);
    const targetBlockedUser = targetBlocked.includes(userId);

    if (userBlockedTarget) {
      return { isBlocked: true, direction: "blocker" };
    } else if (targetBlockedUser) {
      return { isBlocked: true, direction: "blocked" };
    } else {
      return { isBlocked: false, direction: null };
    }
  }

  /**
   * Get list of blocked users for a given user
   * @param userId ID of the user
   * @param token Bearer token for authenticated Supabase client
   */
  async getBlockedUsers(
    userId: string,
    token: string
  ): Promise<BlockedUserResponse[]> {
    const authedSupabase = createAuthenticatedClient(token);

    // Get user's profile with blocked_users array
    const { data: profile, error: profileError } = await authedSupabase
      .from("profiles")
      .select("blocked_users")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw createHttpError({
        message: "Failed to fetch user profile",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: profileError,
      });
    }

    const blockedIds = profile.blocked_users || [];

    if (blockedIds.length === 0) {
      return [];
    }

    // Fetch blocked users' profiles
    const { data: blockedUsers, error: usersError } = await authedSupabase
      .from("profiles")
      .select("id, username, first_name, last_name, avatar_url")
      .in("id", blockedIds);

    if (usersError) {
      throw createHttpError({
        message: "Failed to fetch blocked users",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: usersError,
      });
    }

    if (!blockedUsers || blockedUsers.length === 0) {
      return [];
    }

    return mapBlockedUsersToResponse(blockedUsers);
  }

  /**
   * Remove direct conversations between two users
   * Sets left_at timestamp for both users in any direct conversations
   * @param userId1 ID of the first user
   * @param userId2 ID of the second user
   * @param supabase Authenticated Supabase client
   */
  private async removeDirectConversations(
    userId1: string,
    userId2: string,
    supabase: any
  ): Promise<void> {
    // Find all direct conversations where both users are participants
    const { data: user1Conversations, error: conv1Error } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId1)
      .is("left_at", null);

    if (conv1Error) {
      throw createHttpError({
        message: "Failed to find conversations",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: conv1Error,
      });
    }

    if (!user1Conversations || user1Conversations.length === 0) {
      return; // No conversations to remove
    }

    const conversationIds = user1Conversations.map(
      (c: { conversation_id: string }) => c.conversation_id
    );

    // Find direct conversations where both users are active participants
    const { data: directConversations, error: directError } = await supabase
      .from("conversations")
      .select(
        `
        id,
        type,
        conversation_participants!inner(user_id)
      `
      )
      .in("id", conversationIds)
      .eq("type", "direct")
      .eq("conversation_participants.user_id", userId2)
      .is("conversation_participants.left_at", null);

    if (directError) {
      throw createHttpError({
        message: "Failed to find direct conversations",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: directError,
      });
    }

    if (!directConversations || directConversations.length === 0) {
      return; // No direct conversations to remove
    }

    const directConversationIds = directConversations.map(
      (c: { id: string }) => c.id
    );
    const leftAtTimestamp = new Date().toISOString();

    // Set left_at for both users in these conversations
    const { error: leaveError } = await supabase
      .from("conversation_participants")
      .update({ left_at: leftAtTimestamp })
      .in("conversation_id", directConversationIds)
      .in("user_id", [userId1, userId2])
      .is("left_at", null);

    if (leaveError) {
      throw createHttpError({
        message: "Failed to remove conversations",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: leaveError,
      });
    }
  }
}
