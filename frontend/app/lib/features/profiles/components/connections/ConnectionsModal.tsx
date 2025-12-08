"use client";

import Image from "next/image";
import { Button } from "@/app/components/buttons";
import GlassSurface from "@/app/components/glass-surface";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { useAppStore } from "@/app/lib/stores/app-store";
import {
  useAcceptConnection,
  useRejectConnection,
  useCancelConnection,
  useMyProfile,
  useMyConnections,
  useUserConnections,
} from "@/app/lib/features/profiles";
import type { Connection } from "@/app/lib/features/profiles/api";

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  username: string;
}

/**
 * ConnectionsModal component
 *
 * Displays connections in a modal:
 * - For own profile: Shows pending connections at top (with accept/reject buttons) + accepted connections
 * - For other profiles: Shows only accepted connections (no pending, no buttons)
 */
export function ConnectionsModal({
  isOpen,
  onClose,
  userId,
  username,
}: ConnectionsModalProps) {
  const currentUserId = useAppStore((state) => state.user?.id);
  const isOwnProfile = !userId || userId === currentUserId;
  const { data: currentUserProfile } = useMyProfile();

  const { data: myConnections, isLoading: isLoadingMyConnections } =
    useMyConnections({ enabled: isOwnProfile && isOpen });
  const { data: userConnections, isLoading: isLoadingUserConnections } =
    useUserConnections({ userId, enabled: !isOwnProfile && isOpen });

  const acceptConnection = useAcceptConnection();
  const rejectConnection = useRejectConnection();
  const cancelConnection = useCancelConnection();

  const connectionsToUse = isOwnProfile ? myConnections : userConnections;
  const isLoading = isOwnProfile
    ? isLoadingMyConnections
    : isLoadingUserConnections;

  const pendingConnections =
    isOwnProfile && connectionsToUse
      ? connectionsToUse.filter((conn) => {
          return (
            conn.status === "pending" && conn.recipientId === currentUserId
          );
        })
      : [];

  const acceptedConnections = connectionsToUse
    ? connectionsToUse.filter((conn) => conn.status === "accepted")
    : [];

  const handleAccept = (requestId: string) => {
    acceptConnection.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectConnection.mutate(requestId);
  };

  const handleRemove = (requestId: string) => {
    cancelConnection.mutate(requestId);
  };

  const getOtherUser = (connection: Connection) => {
    let otherUser;

    if (isOwnProfile) {
      otherUser =
        connection.recipientId === currentUserId
          ? connection.requester
          : connection.recipient;
    } else {
      otherUser =
        connection.requesterId === userId
          ? connection.recipient
          : connection.requester;
    }

    if (otherUser?.id === currentUserId && currentUserProfile) {
      return {
        id: currentUserProfile.id,
        username: currentUserProfile.username,
        firstName: currentUserProfile.firstName,
        lastName: currentUserProfile.lastName,
        avatarUrl: currentUserProfile.avatarUrl,
        bio: currentUserProfile.bio,
      };
    }

    return otherUser;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-[calc(100%-2rem)] mx-auto"
      >
        <GlassSurface
          className="relative w-full rounded-3xl overflow-hidden"
          borderRadius={24}
          width="100%"
          height="600px"
        >
          <div
            className="flex flex-col w-full h-full"
            style={{
              width: "100%",
              minHeight: "500px",
              maxHeight: "85vh",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/20 w-full">
              <h2 className="text-h2 font-semibold text-white truncate pr-4">
                {isOwnProfile ? "My Connections" : `${username}'s Connections`}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:opacity-70 transition-opacity shrink-0"
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 w-full"
              style={{
                minHeight: "300px",
                flex: "1 1 auto",
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size={40} />
                </div>
              ) : (
                <div className="space-y-0 w-full">
                  {/* Pending Connections (only for own profile) */}
                  {isOwnProfile && pendingConnections.length > 0 && (
                    <div className="space-y-0">
                      <div className="space-y-0">
                        {pendingConnections.map((connection) => {
                          const otherUser = getOtherUser(connection);
                          if (!otherUser) return null;

                          return (
                            <ConnectionRow
                              key={connection.id}
                              user={otherUser}
                              connection={connection}
                              showActions={isOwnProfile}
                              onAccept={() => handleAccept(connection.id)}
                              onReject={() => handleReject(connection.id)}
                              isAccepting={acceptConnection.isPending}
                              isRejecting={rejectConnection.isPending}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Separator line between pending and accepted */}
                  {isOwnProfile &&
                    pendingConnections.length > 0 &&
                    acceptedConnections.length > 0 && (
                      <div className="border-t border-white/10 my-4" />
                    )}

                  {/* Accepted Connections */}
                  {acceptedConnections.length > 0 ? (
                    <div className="space-y-0">
                      <div className="space-y-0">
                        {acceptedConnections.map((connection) => {
                          const otherUser = getOtherUser(connection);
                          if (!otherUser) return null;

                          return (
                            <ConnectionRow
                              key={connection.id}
                              user={otherUser}
                              connection={connection}
                              showActions={false}
                              showRemove={isOwnProfile}
                              onRemove={() => handleRemove(connection.id)}
                              isRemoving={cancelConnection.isPending}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    !isLoading &&
                    pendingConnections.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-body text-grey">
                          {isOwnProfile
                            ? "No connections yet"
                            : "No connections to show"}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}

interface ConnectionRowProps {
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  connection: Connection;
  showActions: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  isRemoving?: boolean;
}

function ConnectionRow({
  user,
  showActions,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
  showRemove = false,
  onRemove,
  isRemoving = false,
}: ConnectionRowProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Image
          src={user.avatarUrl || "/avatars/default-avatar.png"}
          alt={`${displayName}'s avatar`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-white truncate">
            {displayName}
          </p>
          {user.bio && (
            <p className="text-sm text-grey/80 mt-1 line-clamp-2">{user.bio}</p>
          )}
        </div>
      </div>
      {showActions && onAccept && onReject && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            onClick={onAccept}
            disabled={isAccepting || isRejecting}
            className="min-w-[80px]"
          >
            {isAccepting ? "..." : "Accept"}
          </Button>
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={isAccepting || isRejecting}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 min-w-[80px]"
          >
            {isRejecting ? "..." : "Reject"}
          </Button>
        </div>
      )}
      {showRemove && onRemove && (
        <div className="flex items-center shrink-0">
          <Button
            variant="secondary"
            onClick={onRemove}
            disabled={isRemoving}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            {isRemoving ? "..." : "Remove"}
          </Button>
        </div>
      )}
    </div>
  );
}
