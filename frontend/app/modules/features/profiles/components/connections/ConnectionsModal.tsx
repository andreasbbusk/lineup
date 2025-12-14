"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/modules/components/buttons";
import GlassSurface from "@/app/modules/components/glass-surface";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { useAppStore } from "@/app/modules/stores/Store";
import type { Connection } from "../../types";
import {
  useAcceptConnection,
  useRejectConnection,
  useRemoveConnection,
} from "@/app/modules/hooks/mutations";
import {
  useMyConnections,
  useUserConnections,
} from "@/app/modules/hooks/queries";
import { useMyProfile } from "@/app/modules/features/profiles/hooks/queries/useProfile";
import { Avatar } from "@/app/modules/components/avatar";

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
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const currentUserId = useAppStore((state) => state.user?.id);
  const isOwnProfile = !userId || userId === currentUserId;
  const { data: currentUserProfile } = useMyProfile();

  const {
    data: myConnections,
    isLoading: isLoadingMyConnections,
    isFetching: isFetchingMyConnections,
  } = useMyConnections({ enabled: isOwnProfile && isOpen });
  const {
    data: userConnections,
    isLoading: isLoadingUserConnections,
    isFetching: isFetchingUserConnections,
  } = useUserConnections({ userId, enabled: !isOwnProfile && isOpen });

  const acceptConnection = useAcceptConnection();
  const rejectConnection = useRejectConnection();
  const removeConnection = useRemoveConnection();

  const connectionsToUse = isOwnProfile ? myConnections : userConnections;
  const isLoading = isOwnProfile
    ? isLoadingMyConnections
    : isLoadingUserConnections;
  const isRefetching = isOwnProfile
    ? isFetchingMyConnections && !isLoadingMyConnections
    : isFetchingUserConnections && !isLoadingUserConnections;

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
    setAcceptingId(requestId);
    acceptConnection.mutate(requestId, {
      onSettled: () => {
        setAcceptingId((prev) => (prev === requestId ? null : prev));
      },
    });
  };

  const handleReject = (requestId: string) => {
    setRejectingId(requestId);
    rejectConnection.mutate(requestId, {
      onSettled: () => {
        setRejectingId((prev) => (prev === requestId ? null : prev));
      },
    });
  };

  const handleRemove = (connection: Connection) => {
    // Use the connection ID to delete it
    setRemovingId(connection.id);
    removeConnection.mutate(connection.id, {
      onSettled: () => {
        setRemovingId((prev) => (prev === connection.id ? null : prev));
      },
    });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full sm:w-[calc(100%-2rem)] mx-auto h-[calc(100vh-5rem)] sm:h-[500px] max-h-[80vh] sm:max-h-[500px] mb-4 sm:mb-0"
      >
        <GlassSurface
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden h-full"
          borderRadius={16}
          width="100%"
          height="100%"
        >
          <div
            className="flex flex-col w-full h-full"
            style={{
              width: "100%",
              minHeight: "400px",
              background: "transparent",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/20 w-full shrink-0">
              <h2 className="text-lg sm:text-h2 font-semibold text-white truncate pr-2 sm:pr-4">
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
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 w-full custom-scrollbar relative"
              style={{
                minHeight: "200px",
                flex: "1 1 auto",
                background: "transparent",
              }}
            >
              {isRefetching && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-black/40 rounded-full p-3">
                    <LoadingSpinner />
                  </div>
                </div>
              )}
              {isLoading ? (
                <div
                  className="flex items-center justify-center min-h-[300px] w-full"
                  style={{ background: "transparent" }}
                >
                  <LoadingSpinner />
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
                              isAccepting={acceptingId === connection.id}
                              isRejecting={rejectingId === connection.id}
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
                              onRemove={() => handleRemove(connection)}
                              isRemoving={removingId === connection.id}
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
    <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4">
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
      >
        <Avatar
          size="md"
          fallback={
            (user?.firstName?.charAt(0)?.toUpperCase() || "") +
            (user?.lastName?.charAt(0)?.toUpperCase() || "")
          }
          src={user?.avatarUrl}
          alt={`${user?.username}'s avatar`}
        ></Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-body font-medium text-white truncate">
            {displayName}
          </p>
          {user.bio && (
            <p className="text-xs sm:text-sm text-grey/80 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </Link>
      {showActions && onAccept && onReject && (
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="secondary"
            glass
            onClick={onAccept}
            disabled={isAccepting || isRejecting}
            className="text-black min-w-[70px] sm:min-w-20 text-xs sm:text-sm px-2 py-1.25 sm:px-4 text-center"
          >
            {isAccepting ? "..." : "Accept"}
          </Button>
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={isAccepting || isRejecting}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 min-w-[70px] sm:min-w-20 text-xs sm:text-sm px-2 sm:px-4"
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
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-xs sm:text-sm px-2 sm:px-4 min-w-[70px] sm:min-w-20"
          >
            {isRemoving ? "..." : "Remove"}
          </Button>
        </div>
      )}
    </div>
  );
}
