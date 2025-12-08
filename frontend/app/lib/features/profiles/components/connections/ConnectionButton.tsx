"use client";

import { Button } from "@/app/components/buttons";
import {
  useConnectionStatus,
  getConnectionButtonState,
  useSendConnection,
  useCancelConnection,
} from "@/app/lib/features/profiles";
import { useAppStore } from "@/app/lib/stores/app-store";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { UserRoundPlus, UserRoundCheck, UserRoundX } from "lucide-react";

interface ConnectionButtonProps {
  /** The user ID of the profile being viewed */
  targetUserId: string | null;
  /** Optional className for styling */
  className?: string;
}

/**
 * ConnectionButton component
 * Displays different states based on connection status:
 * - "Connect" - Not connected, can send request
 * - "Pending" - Request sent, waiting for response (can cancel)
 * - "Connected" - Already connected
 */
export function ConnectionButton({
  targetUserId,
  className = "",
}: ConnectionButtonProps) {
  const currentUserId = useAppStore((state) => state.user?.id);
  const { data: connection, isLoading } = useConnectionStatus(targetUserId);
  const sendConnection = useSendConnection();
  const cancelConnection = useCancelConnection();

  // Don't show button if viewing own profile
  if (!targetUserId || !currentUserId || targetUserId === currentUserId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={className}>
        <LoadingSpinner size={20} />
      </div>
    );
  }

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

  switch (state) {
    case "not_connected":
      return (
        <Button
          variant="primary"
          glass
          onClick={handleConnect}
          disabled={sendConnection.isPending}
          className={className}
        >
          <div className="flex items-center gap-2">
            <UserRoundPlus size={20} />
            <span>Connect</span>
          </div>
        </Button>
      );

    case "pending_sent":
      return (
        <Button
          variant="primary"
          glass
          onClick={handleCancel}
          disabled={cancelConnection.isPending}
          className={className}
        >
          <div className="flex items-center gap-2">
            <UserRoundX size={20} />
            <span>Pending</span>
          </div>
        </Button>
      );

    case "pending_received":
      // Accept/reject is handled through the connections modal
      return null;

    case "connected":
      return (
        <Button
          variant="primary"
          glass
          disabled
          onClick={() => {}} // Required prop, but disabled so no action
          className={className}
        >
          <div className="flex items-center gap-2">
            <UserRoundCheck size={20} />
            <span>Connected</span>
          </div>
        </Button>
      );

    default:
      return null;
  }
}
