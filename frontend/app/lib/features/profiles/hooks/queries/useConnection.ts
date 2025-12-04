"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/app/lib/stores/app-store";
import {
  getConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  getConnectionRequests,
  getUserAcceptedConnections,
  type Connection,
} from "../../api";

// ==================== Connection Status ====================

/**
 * Hook to get connection status between current user and a target user
 * Returns the connection if it exists, null if no connection
 */
export function useConnectionStatus(targetUserId: string | null) {
  const currentUserId = useAppStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["connectionStatus", currentUserId, targetUserId],
    queryFn: async () => {
      if (!targetUserId || !currentUserId || targetUserId === currentUserId) {
        return null;
      }
      return getConnectionStatus(targetUserId);
    },
    enabled:
      !!targetUserId && !!currentUserId && targetUserId !== currentUserId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Helper to determine connection button state
 */
export function getConnectionButtonState(
  connection: Connection | null | undefined,
  currentUserId: string | undefined,
  targetUserId: string | null
): {
  state: "not_connected" | "pending_sent" | "pending_received" | "connected";
  requestId: string | null;
} {
  if (!connection || !currentUserId || !targetUserId) {
    return { state: "not_connected", requestId: null };
  }

  if (connection.status === "accepted") {
    return { state: "connected", requestId: connection.id };
  }

  if (connection.status === "pending") {
    if (connection.requesterId === currentUserId) {
      return { state: "pending_sent", requestId: connection.id };
    } else {
      return { state: "pending_received", requestId: connection.id };
    }
  }

  return { state: "not_connected", requestId: null };
}

// ==================== Connection Actions ====================

/**
 * Hook to send a connection request
 */
export function useSendConnection() {
  const queryClient = useQueryClient();
  const currentUserId = useAppStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (recipientId: string) => {
      return sendConnectionRequest(recipientId);
    },
    onSuccess: (_, recipientId) => {
      // Invalidate connection status for this specific user
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", currentUserId, recipientId],
      });
      // Invalidate all connection status queries (for other components)
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus"],
      });
      // Invalidate connection requests list
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
      });
      // Invalidate connections for modal
      queryClient.invalidateQueries({
        queryKey: ["myConnections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
      });
    },
  });
}

/**
 * Hook to accept a connection request
 */
export function useAcceptConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return acceptConnectionRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus"],
      });
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
      });
      // Invalidate connections for modal
      queryClient.invalidateQueries({
        queryKey: ["myConnections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
      });
    },
  });
}

/**
 * Hook to reject a connection request
 */
export function useRejectConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return rejectConnectionRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus"],
      });
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
      });
      // Invalidate connections for modal
      queryClient.invalidateQueries({
        queryKey: ["myConnections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
      });
    },
  });
}

/**
 * Hook to cancel a connection request
 */
export function useCancelConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return cancelConnectionRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus"],
      });
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
      });
      // Invalidate connections for modal
      queryClient.invalidateQueries({
        queryKey: ["myConnections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
      });
    },
  });
}

/**
 * Hook to get all connection requests for the current user
 */
export function useConnectionRequests() {
  return useQuery({
    queryKey: ["connectionRequests"],
    queryFn: getConnectionRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==================== Connection Lists ====================

interface UseMyConnectionsOptions {
  enabled?: boolean;
}

/**
 * Hook to get all connections for the current user
 * Returns both pending and accepted connections
 */
export function useMyConnections(options: UseMyConnectionsOptions = {}) {
  return useQuery({
    queryKey: ["myConnections"],
    queryFn: getConnectionRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options.enabled !== false,
  });
}

interface UseUserConnectionsOptions {
  userId: string | null;
  enabled?: boolean;
}

/**
 * Hook to get accepted connections for a specific user
 * Only returns accepted connections (public data)
 */
export function useUserConnections(options: UseUserConnectionsOptions) {
  const { userId, enabled = true } = options;

  return useQuery({
    queryKey: ["userConnections", userId],
    queryFn: async () => {
      if (!userId) return [];
      return getUserAcceptedConnections(userId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled && !!userId,
  });
}
