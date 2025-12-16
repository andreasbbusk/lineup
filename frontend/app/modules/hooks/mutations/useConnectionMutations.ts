import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
} from "@/app/modules/api/connectionsApi";
import { useAppStore } from "@/app/modules/stores/Store";
import { NOTIFICATION_QUERY_KEYS } from "@/app/modules/features/notifications";

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
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", currentUserId, recipientId],
      });
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myConnections"] });
      queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      // Invalidate notification queries when sending connection request (creates notification)
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all, exact: false });
    },
  });
}

/**
 * Hook to accept a connection request
 */
export function useAcceptConnection() {
  const queryClient = useQueryClient();
  const currentUserId = useAppStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (requestId: string) => {
      return acceptConnectionRequest(requestId);
    },
    onSuccess: (connection) => {
      const otherUserId =
        connection.requesterId === currentUserId
          ? connection.recipientId
          : connection.requesterId;

      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myConnections"] });
      queryClient.invalidateQueries({
        queryKey: ["userConnections", otherUserId],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      // Invalidate notification queries when accepting connection (creates notification)
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all, exact: false });
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
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myConnections"] });
      queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
    },
  });
}

/**
 * Hook to cancel a connection request (delete pending request you sent)
 */
export function useCancelConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return cancelConnectionRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myConnections"] });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
    },
  });
}

/**
 * Hook to remove an accepted connection (either user can remove)
 */
export function useRemoveConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      return removeConnection(connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["myConnections"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["userConnections"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
    },
  });
}
