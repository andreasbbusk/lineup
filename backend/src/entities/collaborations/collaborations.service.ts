import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { CollaborationInsert } from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import { mapCollaborationsToResponse } from "./collaborations.mapper.js";
import { CollaborationResponse } from "../../types/api.types.js";

export class CollaborationsService {
  /**
   * Get all collaborations for a user (authenticated)
   * Returns collaborations with collaborator profile information
   */
  async getUserCollaborations(
    userId: string,
    token: string
  ): Promise<CollaborationResponse[]> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    const { data: collaborations, error } = await authedSupabase
      .from("user_collaborations")
      .select(
        `
        *,
        collaborator:profiles!user_collaborations_collaborator_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch collaborations: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCollaborationsToResponse(collaborations || []);
  }

  /**
   * Get all collaborations for a user (public)
   * Returns collaborations with collaborator profile information
   * This method doesn't require authentication
   */
  async getUserCollaborationsPublic(
    userId: string
  ): Promise<CollaborationResponse[]> {
    const { data: collaborations, error } = await supabase
      .from("user_collaborations")
      .select(
        `
        *,
        collaborator:profiles!user_collaborations_collaborator_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch collaborations: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCollaborationsToResponse(collaborations || []);
  }

  /**
   * Create a collaboration
   * Only the authenticated user can create collaborations for themselves
   */
  async createCollaboration(
    userId: string,
    collaboratorId: string,
    description: string | null | undefined,
    token: string
  ): Promise<CollaborationResponse> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Validate that user is not collaborating with themselves
    if (userId === collaboratorId) {
      throw createHttpError({
        message: "You cannot create a collaboration with yourself",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Verify the collaborator exists
    const { data: collaborator, error: collaboratorError } =
      await authedSupabase
        .from("profiles")
        .select("id")
        .eq("id", collaboratorId)
        .single();

    if (collaboratorError || !collaborator) {
      throw createHttpError({
        message: "Collaborator not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Check if collaboration already exists
    const { data: existingCollaboration } = await authedSupabase
      .from("user_collaborations")
      .select("id")
      .eq("user_id", userId)
      .eq("collaborator_id", collaboratorId)
      .single();

    if (existingCollaboration) {
      throw createHttpError({
        message: "Collaboration already exists",
        statusCode: 409,
        code: "CONFLICT",
      });
    }

    // Create the collaboration
    const collaborationInsert: CollaborationInsert = {
      user_id: userId,
      collaborator_id: collaboratorId,
      description: description ?? null,
    };

    const { data: collaboration, error } = await authedSupabase
      .from("user_collaborations")
      .insert(collaborationInsert)
      .select(
        `
        *,
        collaborator:profiles!user_collaborations_collaborator_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .single();

    if (error || !collaboration) {
      throw createHttpError({
        message: `Failed to create collaboration: ${error?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCollaborationsToResponse([collaboration])[0];
  }

  /**
   * Delete a collaboration
   * Only the collaboration owner can delete their own collaboration
   */
  async deleteCollaboration(
    userId: string,
    collaborationId: string,
    token: string
  ): Promise<void> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the collaboration exists and belongs to the user
    const { data: collaboration, error: fetchError } = await authedSupabase
      .from("user_collaborations")
      .select("user_id")
      .eq("id", collaborationId)
      .single();

    if (fetchError || !collaboration) {
      throw createHttpError({
        message: "Collaboration not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (collaboration.user_id !== userId) {
      throw createHttpError({
        message: "You can only delete your own collaborations",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Delete the collaboration
    const { error } = await authedSupabase
      .from("user_collaborations")
      .delete()
      .eq("id", collaborationId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete collaboration: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
