"use client";

import Image from "next/image";
import { Button } from "@/app/components/buttons";
import GlassSurface from "@/app/components/glass-surface";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { useAppStore } from "@/app/lib/stores/app-store";
// Always using mock data for now
// import {
//   useMyConnections,
//   useUserConnections,
// } from "../../hooks/queries/useConnection";
import {
  useAcceptConnection,
  useRejectConnection,
} from "@/app/lib/features/profiles";
import type { Connection } from "@/app/lib/features/profiles/api";

interface ConnectionsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** User ID of the profile being viewed (null for own profile) */
  userId: string | null;
  /** Username of the profile being viewed (for display) */
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

  // Always using mock data for now, so hooks are commented out
  // const { data: myConnections, isLoading: isLoadingMyConnections } =
  //   useMyConnections({ enabled: isOwnProfile && isOpen });
  // const { data: userConnections, isLoading: isLoadingUserConnections } =
  //   useUserConnections({ userId, enabled: !isOwnProfile && isOpen });

  const acceptConnection = useAcceptConnection();
  const rejectConnection = useRejectConnection();

  // Always use mock data for now
  const useMockData = true;
  const isLoading = false; // Mock data is instant
  const mockConnections: Connection[] = useMockData
    ? [
        {
          id: "mock-1",
          requesterId: "mock-requester-1",
          recipientId: currentUserId || "current-user",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requester: {
            id: "mock-requester-1",
            username: "johndoe",
            firstName: "John",
            lastName: "Doe",
            avatarUrl: "/avatars/default-avatar.png",
            bio: "Guitarist and songwriter",
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "blue",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          recipient: {
            id: currentUserId || "current-user",
            username: "currentuser",
            firstName: "Current",
            lastName: "User",
            avatarUrl: "/avatars/default-avatar.png",
            bio: null,
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "default",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        {
          id: "mock-2",
          requesterId: "mock-requester-2",
          recipientId: currentUserId || "current-user",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requester: {
            id: "mock-requester-2",
            username: "janesmith",
            firstName: "Jane",
            lastName: "Smith",
            avatarUrl: "/avatars/default-avatar.png",
            bio: "Drummer and producer",
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "purple",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          recipient: {
            id: currentUserId || "current-user",
            username: "currentuser",
            firstName: "Current",
            lastName: "User",
            avatarUrl: "/avatars/default-avatar.png",
            bio: null,
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "default",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        {
          id: "mock-3",
          requesterId: currentUserId || "current-user",
          recipientId: "mock-recipient-1",
          status: "accepted",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requester: {
            id: currentUserId || "current-user",
            username: "currentuser",
            firstName: "Current",
            lastName: "User",
            avatarUrl: "/avatars/default-avatar.png",
            bio: null,
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "default",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          recipient: {
            id: "mock-recipient-1",
            username: "bobwilson",
            firstName: "Bob",
            lastName: "Wilson",
            avatarUrl: "/avatars/default-avatar.png",
            bio: "Bassist and composer",
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "green",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        {
          id: "mock-4",
          requesterId: "mock-requester-3",
          recipientId: currentUserId || "current-user",
          status: "accepted",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requester: {
            id: "mock-requester-3",
            username: "alicebrown",
            firstName: "Alice",
            lastName: "Brown",
            avatarUrl: "/avatars/default-avatar.png",
            bio: "Vocalist and performer",
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "red",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          recipient: {
            id: currentUserId || "current-user",
            username: "currentuser",
            firstName: "Current",
            lastName: "User",
            avatarUrl: "/avatars/default-avatar.png",
            bio: null,
            aboutMe: null,
            location: "",
            userType: "musician",
            themeColor: "default",
            spotifyPlaylistUrl: null,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ]
    : [];

  const connectionsToUse = mockConnections;

  // Separate pending and accepted connections
  const pendingConnections =
    isOwnProfile && connectionsToUse
      ? connectionsToUse.filter((conn) => {
          // Show pending requests where current user is the recipient
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

  const getOtherUser = (connection: Connection) => {
    if (isOwnProfile) {
      // For own profile, show the other user (requester for received, recipient for sent)
      return connection.recipientId === currentUserId
        ? connection.requester
        : connection.recipient;
    } else {
      // For other profiles, show the other user (not the profile being viewed)
      return connection.requesterId === userId
        ? connection.recipient
        : connection.requester;
    }
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
                className="text-white hover:opacity-70 transition-opacity flex-shrink-0"
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
                <div className="space-y-6 w-full">
                  {/* Pending Connections (only for own profile) */}
                  {isOwnProfile && pendingConnections.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-h3 font-semibold text-white">
                        Pending Requests
                      </h3>
                      <div className="space-y-3">
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

                  {/* Accepted Connections */}
                  {acceptedConnections.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-h3 font-semibold text-white">
                        {isOwnProfile && pendingConnections.length > 0
                          ? "Connected"
                          : "Connections"}
                      </h3>
                      <div className="space-y-3">
                        {acceptedConnections.map((connection) => {
                          const otherUser = getOtherUser(connection);
                          if (!otherUser) return null;

                          return (
                            <ConnectionRow
                              key={connection.id}
                              user={otherUser}
                              connection={connection}
                              showActions={false}
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
}

function ConnectionRow({
  user,
  showActions,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: ConnectionRowProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Image
          src={user.avatarUrl || "/avatars/default-avatar.png"}
          alt={`${displayName}'s avatar`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-white truncate">
            {displayName}
          </p>
          {user.bio && <p className="text-sm text-grey truncate">{user.bio}</p>}
        </div>
      </div>
      {showActions && onAccept && onReject && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="primary"
            onClick={onAccept}
            disabled={isAccepting || isRejecting}
          >
            {isAccepting ? "..." : "Accept"}
          </Button>
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={isAccepting || isRejecting}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            {isRejecting ? "..." : "Reject"}
          </Button>
        </div>
      )}
    </div>
  );
}
