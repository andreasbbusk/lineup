"use client";

import { Button } from "@/app/modules/components/buttons";
import { useConnectionButton } from "@/app/modules/features/profiles";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";

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
 *
 * Uses the useConnectionButton hook for all logic, making it easy to create
 * variants (e.g., ConnectionButtonCompact, ConnectionButtonCard) that reuse
 * the same hook with different styling.
 */
export function ConnectionButton({ targetUserId }: ConnectionButtonProps) {
  const {
    state,
    handleConnect,
    handleCancel,
    isLoading,
    isPending,
    shouldRender,
  } = useConnectionButton(targetUserId);

  // Don't show button if viewing own profile or invalid state
  if (!shouldRender) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner size={20} />
      </div>
    );
  }

  switch (state) {
    case "not_connected":
      return (
        <Button
          variant="primary"
          glass
          onClick={handleConnect}
          disabled={isPending}
          icon="add-circle"
          // className={className}
        >
          Connect
          {/* <div className="flex items-center gap-2"> */}
          {/* <UserRoundPlus size={20} /> */}
          {/* <span>Connect</span> */}
          {/* </div> */}
        </Button>
      );

    case "pending_sent":
      return (
        <Button
          variant="primary"
          glass
          onClick={handleCancel}
          disabled={isPending}
          icon="loading"

          // className={className}
        >
          Pending
          {/* <div className="flex items-center gap-2">
						<UserRoundX size={20} />
						<span>Pending</span>
					</div> */}
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
          icon="check"
          onClick={() => {}} // Required prop, but disabled so no action
          // className={className}
        >
          Connected
          {/* <div className="flex items-center gap-2">
						<UserRoundCheck size={20} />
						<span>Connected</span>
					</div> */}
        </Button>
      );

    default:
      return null;
  }
}
