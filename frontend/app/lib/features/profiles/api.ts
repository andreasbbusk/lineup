import { apiClient, handleApiError } from "../../api/api-client";
import type { components } from "@/app/lib/types/api";

// Export types from generated schema
export type UserProfile = components["schemas"]["UserProfile"];
export type ProfileUpdateRequest = components["schemas"]["UpdateProfileDto"];
export type Connection = components["schemas"]["Connection"];
export type ConnectionStatus = components["schemas"]["ConnectionStatus"];

/**
 * Get user profile by username
 * Public endpoint - returns public data unless viewing own profile
 */
export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data, error, response } = await apiClient.GET("/users/{username}", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Update user profile
 * Requires authentication
 */
export async function updateUserProfile(
  username: string,
  updates: ProfileUpdateRequest
): Promise<UserProfile> {
  const { data, error, response } = await apiClient.PUT("/users/{username}", {
    params: {
      path: { username },
    },
    body: updates,
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

// ==================== Connection API Functions ====================

/**
 * Get all connection requests for the authenticated user
 * Returns both sent and received connection requests
 */
export async function getConnectionRequests(): Promise<Connection[]> {
  // @ts-expect-error - Connection endpoints not yet in generated types. Regenerate types after running `npm run tsoa` in backend.
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
  // Get both sent and received connections, then filter for accepted ones
  const sentResult = (await apiClient.GET("/connections/sent/{userId}", {
    params: { path: { userId } },
  })) as { data?: Connection[]; error?: unknown; response?: Response };

  const receivedResult = (await apiClient.GET(
    "/connections/received/{userId}",
    {
      params: { path: { userId } },
    }
  )) as { data?: Connection[]; error?: unknown; response?: Response };

  // Handle errors
  if (sentResult.error) {
    handleApiError(sentResult.error, sentResult.response);
  }
  if (receivedResult.error) {
    handleApiError(receivedResult.error, receivedResult.response);
  }

  const sentConnections = (sentResult.data as Connection[]) || [];
  const receivedConnections = (receivedResult.data as Connection[]) || [];

  // Combine and filter for accepted connections
  const allConnections = [...sentConnections, ...receivedConnections];
  return allConnections.filter((conn) => conn.status === "accepted");
}

/**
 * Get connection status between current user and another user
 * Returns the connection if it exists, null otherwise
 */
export async function getConnectionStatus(
  targetUserId: string
): Promise<Connection | null> {
  const connections = await getConnectionRequests();

  // Find connection where current user is either requester or recipient
  const connection = connections.find(
    (conn) =>
      (conn.requesterId === targetUserId ||
        conn.recipientId === targetUserId) &&
      conn.status !== "rejected"
  );

  return connection || null;
}

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

  const requestBody = {
    recipientId,
  };

  // @ts-expect-error - Connection endpoints not yet in generated types. Regenerate types after running `npm run tsoa` in backend.
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
      params: {
        path: { requestId },
      },
      body: {
        status: "accepted",
      },
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
      params: {
        path: { requestId },
      },
      body: {
        status: "rejected",
      },
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
      params: {
        path: { requestId },
      },
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
      params: {
        path: { requestId: connectionId },
      },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  // If we get here, the deletion was successful (204 No Content)
  // The DELETE endpoint returns void, so no data to return
}
