import { apiClient, handleApiError } from "./apiClient";
import type { components } from "@/app/modules/types/api";

type Connection = components["schemas"]["Connection"];

/**
 * Connections API - Global Infrastructure
 *
 * Handles all connection-related API calls:
 * - Connection requests (send, accept, reject, cancel)
 * - Connection status checks
 * - Connection lists (requests, accepted)
 */

// ==================== Connection Status ====================

/**
 * Get connection status between current user and another user
 * Returns the connection if it exists, null otherwise
 */
export async function getConnectionStatus(
  targetUserId: string
): Promise<Connection | null> {
  const { data, error, response } = await apiClient.GET(
    "/connections/status/{targetUserId}",
    {
      params: { path: { targetUserId } },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  return data ? (data as unknown as Connection) : null;
}

// ==================== Connection Lists ====================

/**
 * Get all connection requests for the authenticated user
 * Returns both sent and received connection requests
 */
export async function getConnectionRequests(): Promise<Connection[]> {
  // @ts-expect-error - Connection endpoints not yet in generated types
  const { data, error, response } = await apiClient.GET("/connections/", {});

  if (error) {
    handleApiError(error, response);
  }

  return (data as Connection[]) || [];
}

/**
 * Get accepted connections for a specific user (public endpoint)
 * Returns only accepted connections for the specified user
 */
export async function getUserAcceptedConnections(
  userId: string
): Promise<Connection[]> {
  const { data, error, response } = await apiClient.GET(
    "/connections/accepted/{userId}",
    {
      params: { path: { userId } },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  return (data as Connection[]) || [];
}

// ==================== Connection Actions ====================

/**
 * Send a connection request to another user
 */
export async function sendConnectionRequest(
  recipientId: string
): Promise<Connection> {
  // Validate recipientId is a valid UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(recipientId)) {
    throw new Error(
      `Invalid recipientId format: ${recipientId}. Expected UUID format.`
    );
  }

  const requestBody = { recipientId };

  // @ts-expect-error - Connection endpoints not yet in generated types
  const { data, error, response } = await apiClient.POST("/connections/", {
    body: requestBody,
  });

  if (error) {
    console.error("Connection request error:", { error, response });
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Accept a connection request
 */
export async function acceptConnectionRequest(
  requestId: string
): Promise<Connection> {
  const { data, error, response } = await apiClient.PUT(
    "/connections/{requestId}",
    {
      params: { path: { requestId } },
      body: { status: "accepted" },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Reject a connection request
 */
export async function rejectConnectionRequest(
  requestId: string
): Promise<Connection> {
  const { data, error, response } = await apiClient.PUT(
    "/connections/{requestId}",
    {
      params: { path: { requestId } },
      body: { status: "rejected" },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Cancel a connection request (delete pending request you sent)
 */
export async function cancelConnectionRequest(
  requestId: string
): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    "/connections/{requestId}",
    {
      params: { path: { requestId } },
    }
  );

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Remove an accepted connection (either user can remove)
 */
export async function removeConnection(connectionId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    "/connections/{requestId}",
    {
      params: { path: { requestId: connectionId } },
    }
  );

  if (error) {
    handleApiError(error, response);
  }
}
