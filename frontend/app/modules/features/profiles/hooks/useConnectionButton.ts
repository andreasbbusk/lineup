import {
  useSendConnection,
  useCancelConnection,
} from "@/app/modules/hooks/mutations";
import { useConnectionStatus } from "@/app/modules/hooks/queries";
import { useAppStore } from "@/app/modules/stores/Store";
import type { Connection } from "../types";

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

/**
 * Hook to encapsulate all connection button logic
 * Feature-specific hook that uses global infrastructure
 */
export function useConnectionButton(targetUserId: string | null) {
  const currentUserId = useAppStore((state) => state.user?.id);
  const { data: connection, isLoading } = useConnectionStatus(targetUserId);
  const sendConnection = useSendConnection();
  const cancelConnection = useCancelConnection();

  const shouldRender =
    !!targetUserId && !!currentUserId && targetUserId !== currentUserId;

  const { state, requestId } = getConnectionButtonState(
    connection,
    currentUserId,
    targetUserId
  );

  const handleConnect = () => {
    if (targetUserId) {
      sendConnection.mutate(targetUserId);
    }
  };

  const handleCancel = () => {
    if (requestId) {
      cancelConnection.mutate(requestId);
    }
  };

  return {
    state,
    requestId,
    handleConnect,
    handleCancel,
    isLoading,
    isPending: sendConnection.isPending || cancelConnection.isPending,
    shouldRender,
  };
}
