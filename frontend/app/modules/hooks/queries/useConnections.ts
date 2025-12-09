import { useQuery } from "@tanstack/react-query";
import {
  getConnectionStatus,
  getConnectionRequests,
  getUserAcceptedConnections,
} from "@/app/modules/api/connectionsApi";
import { searchApi } from "@/app/modules/api/searchApi";
import { useAppStore } from "@/app/modules/stores/Store";
import type { components } from "@/app/modules/types/api";

type UserSearchResult = components["schemas"]["UserSearchResult"];

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

// ==================== Connection Lists ====================

/**
 * Hook to get all connection requests for the current user
 * Returns both pending and accepted connections
 */
export function useConnectionRequests() {
  return useQuery({
    queryKey: ["connectionRequests"],
    queryFn: getConnectionRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

interface UseMyConnectionsOptions {
  enabled?: boolean;
}

/**
 * Hook to get all connections for the current user
 * Alias for useConnectionRequests
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
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch user's connected users (for suggestions/autocomplete)
 * Uses search API to get users with isConnected filter
 *
 * Use case: Chat "New Conversation" - show list of connections to message
 */
export function useConnectedUsers() {
  return useQuery({
    queryKey: ["connectedUsers"],
    queryFn: async () => {
      const response = await searchApi.searchUsers("", 100);

      // Filter for connected users only and sort alphabetically
      const connectedUsers = (response?.results || [])
        .filter(
          (result): result is UserSearchResult =>
            result.type === "user" && result.isConnected === true
        )
        .sort((a, b) => a.username.localeCompare(b.username));

      return connectedUsers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
