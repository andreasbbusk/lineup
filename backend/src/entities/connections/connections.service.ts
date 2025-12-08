import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import {
  ConnectionRequestInsert,
  ConnectionRequestUpdate,
} from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  mapConnectionRequestsToResponse,
  mapConnectionRequestToResponse,
} from "./connections.mapper.js";
import { Connection } from "../../types/api.types.js";
import {
  CreateConnectionRequestDto,
  UpdateConnectionRequestDto,
} from "./connections.dto.js";

export class ConnectionsService {
  /**
   * Get all connection requests for the authenticated user
   * Returns both sent and received requests
   */
  async getUserConnectionRequests(
    userId: string,
    token: string
  ): Promise<Connection[]> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    const { data: requests, error } = await authedSupabase
      .from("connection_requests")
      .select(
        `
        *,
        requester:profiles!connection_requests_requester_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        ),
        recipient:profiles!connection_requests_recipient_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        )
      `
      )
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch connection requests: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapConnectionRequestsToResponse(requests || []);
  }

  /**
   * Get connection requests sent by a user (public)
   */
  async getSentConnectionRequests(userId: string): Promise<Connection[]> {
    const { data: requests, error } = await supabase
      .from("connection_requests")
      .select(
        `
        *,
        requester:profiles!connection_requests_requester_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        ),
        recipient:profiles!connection_requests_recipient_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        )
      `
      )
      .eq("requester_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch connection requests: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapConnectionRequestsToResponse(requests || []);
  }

  /**
   * Get connection requests received by a user (public)
   */
  async getReceivedConnectionRequests(userId: string): Promise<Connection[]> {
    const { data: requests, error } = await supabase
      .from("connection_requests")
      .select(
        `
        *,
        requester:profiles!connection_requests_requester_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        ),
        recipient:profiles!connection_requests_recipient_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        )
      `
      )
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch connection requests: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapConnectionRequestsToResponse(requests || []);
  }

  /**
   * Create a connection request
   * Only authenticated users can send connection requests
   */
  async createConnectionRequest(
    userId: string,
    data: CreateConnectionRequestDto,
    token: string
  ): Promise<Connection> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Validate that user is not sending request to themselves
    if (userId === data.recipientId) {
      throw createHttpError({
        message: "You cannot send a connection request to yourself",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Verify the recipient exists
    const { data: recipient, error: recipientError } = await authedSupabase
      .from("profiles")
      .select("id")
      .eq("id", data.recipientId)
      .single();

    if (recipientError || !recipient) {
      throw createHttpError({
        message: "Recipient not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Check if connection request already exists (in either direction)
    const { data: existingRequest } = await authedSupabase
      .from("connection_requests")
      .select("id, status")
      .or(
        `and(requester_id.eq.${userId},recipient_id.eq.${data.recipientId}),and(requester_id.eq.${data.recipientId},recipient_id.eq.${userId})`
      )
      .single();

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        throw createHttpError({
          message: "Users are already connected",
          statusCode: 409,
          code: "CONFLICT",
        });
      }
      throw createHttpError({
        message: "Connection request already exists",
        statusCode: 409,
        code: "CONFLICT",
      });
    }

    // Create the connection request
    const requestInsert: ConnectionRequestInsert = {
      requester_id: userId,
      recipient_id: data.recipientId,
      status: "pending",
    };

    const { data: request, error } = await authedSupabase
      .from("connection_requests")
      .insert(requestInsert)
      .select(
        `
        *,
        requester:profiles!connection_requests_requester_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        ),
        recipient:profiles!connection_requests_recipient_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        )
      `
      )
      .single();

    if (error || !request) {
      throw createHttpError({
        message: `Failed to create connection request: ${error?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapConnectionRequestToResponse(request);
  }

  /**
   * Update a connection request status
   * Only the recipient can accept or reject a request
   */
  async updateConnectionRequest(
    requestId: string,
    userId: string,
    data: UpdateConnectionRequestDto,
    token: string
  ): Promise<Connection> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the request exists and user is the recipient
    const { data: request, error: fetchError } = await authedSupabase
      .from("connection_requests")
      .select("recipient_id, status")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      throw createHttpError({
        message: "Connection request not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (request.recipient_id !== userId) {
      throw createHttpError({
        message: "You can only respond to connection requests sent to you",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    if (request.status !== "pending") {
      throw createHttpError({
        message: "Connection request has already been responded to",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Update the connection request
    const updateData: ConnectionRequestUpdate = {
      status: data.status,
    };

    const { data: updatedRequest, error: updateError } = await authedSupabase
      .from("connection_requests")
      .update(updateData)
      .eq("id", requestId)
      .select(
        `
        *,
        requester:profiles!connection_requests_requester_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        ),
        recipient:profiles!connection_requests_recipient_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio,
          location,
          user_type,
          theme_color,
          spotify_playlist_url,
          onboarding_completed,
          created_at,
          updated_at
        )
      `
      )
      .single();

    if (updateError || !updatedRequest) {
      throw createHttpError({
        message: `Failed to update connection request: ${updateError?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapConnectionRequestToResponse(updatedRequest);
  }

  /**
   * Delete a connection request
   * - For pending requests: Only the requester can delete
   * - For accepted connections: Either user (requester or recipient) can delete
   */
  async deleteConnectionRequest(
    requestId: string,
    userId: string,
    token: string
  ): Promise<void> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the request exists
    const { data: request, error: fetchError } = await authedSupabase
      .from("connection_requests")
      .select("requester_id, recipient_id, status")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      throw createHttpError({
        message: "Connection request not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Check if user is authorized to delete
    const isRequester = request.requester_id === userId;
    const isRecipient = request.recipient_id === userId;
    const isAuthorized =
      isRequester || (isRecipient && request.status === "accepted");

    if (!isAuthorized) {
      if (request.status === "pending") {
        throw createHttpError({
          message: "You can only delete connection requests you sent",
          statusCode: 403,
          code: "FORBIDDEN",
        });
      } else {
        throw createHttpError({
          message: `You can only delete connections you are part of. User: ${userId}, Requester: ${request.requester_id}, Recipient: ${request.recipient_id}, Status: ${request.status}`,
          statusCode: 403,
          code: "FORBIDDEN",
        });
      }
    }

    // Delete the connection request
    const { data: deletedData, error } = await authedSupabase
      .from("connection_requests")
      .delete()
      .eq("id", requestId)
      .select();

    if (error) {
      throw createHttpError({
        message: `Failed to delete connection request: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Verify deletion was successful
    if (!deletedData || deletedData.length === 0) {
      throw createHttpError({
        message:
          "Connection request was not deleted (no rows affected). This may be due to RLS policies blocking the deletion.",
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
