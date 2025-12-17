"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { X } from "lucide-react";
import { Toaster } from "sonner";
import { PageTransition } from "@/app/modules/components/page-transition";
import { ErrorBoundary } from "@/app/modules/components/error-boundary";
import { useNotifications } from "@/app/modules/features/notifications/hooks/useNotifications";
import { NotificationSection } from "@/app/modules/features/notifications/components/notification-section";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import type { NotificationResponse } from "@/app/modules/features/notifications/types";
import { useAcceptConnection } from "@/app/modules/hooks/mutations/useConnectionMutations";
import { useMarkAsRead } from "@/app/modules/features/notifications/hooks/useNotificationMutations";
import { deduplicateConnectionRequests } from "@/app/modules/features/notifications/utils/connectionRequests";
import { sortNotificationsByDateDesc } from "@/app/modules/features/notifications/utils/sortNotifications";
import {
  hasEntityId,
  hasNotificationId,
  hasActorId,
} from "@/app/modules/features/notifications/utils/typeGuards";
import { useStartOrNavigateToChat } from "@/app/modules/hooks";
import { useAppStore } from "@/app/modules/stores/Store";

/**
 * Notifications page
 * Displays notifications grouped by type: Connection requests, Collaboration requests, and Profile interactions
 */
export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useNotifications();
  const acceptConnection = useAcceptConnection();
  const markAsRead = useMarkAsRead();
  const user = useAppStore((state) => state.user);
  const { startOrNavigateToChat } = useStartOrNavigateToChat();

  const notifications = data?.notifications;

  // Memoize sorted arrays to avoid re-sorting on every render
  const uniqueConnectionRequests = useMemo(() => {
    if (!notifications) return [];
    const connectionRequests = [
      ...notifications.connection_request,
      ...notifications.connection_accepted,
    ];
    return sortNotificationsByDateDesc(
      deduplicateConnectionRequests(connectionRequests)
    );
  }, [notifications]);

  // Profile interactions: likes, comments, tagged_in_post, review
  const profileInteractions = useMemo(() => {
    if (!notifications) return [];
    return sortNotificationsByDateDesc([
      ...notifications.like,
      ...notifications.comment,
      ...notifications.tagged_in_post,
      ...notifications.review,
    ]);
  }, [notifications]);

  // Sort collaboration requests by createdAt descending (newest first)
  const sortedCollaborationRequests = useMemo(() => {
    if (!notifications) return [];
    return sortNotificationsByDateDesc(notifications.collaboration_request);
  }, [notifications]);

  // Sort messages by createdAt descending (newest first)
  const sortedMessages = useMemo(() => {
    if (!notifications) return [];
    return sortNotificationsByDateDesc(notifications.message);
  }, [notifications]);

  const handleClose = () => {
    router.back();
  };

  // Handle connection request accept
  const handleAcceptConnection = (notification: NotificationResponse) => {
    if (!hasEntityId(notification)) {
      return;
    }

    // Accept the connection request
    acceptConnection.mutate(notification.entityId, {
      onSuccess: () => {
        // Mark notification as read after successful acceptance
        if (hasNotificationId(notification)) {
          markAsRead.mutate({
            notificationId: notification.id,
            isRead: true,
          });
        }
      },
    });
  };

  // Handle collaboration request reply
  const handleReplyCollaboration = (notification: NotificationResponse) => {
    if (!user || !hasActorId(notification)) return;

    // Mark notification as read
    if (hasNotificationId(notification) && !notification.isRead) {
      markAsRead.mutate({
        notificationId: notification.id,
        isRead: true,
      });
    }

    // Get the post ID from the notification entity
    const postId =
      notification.entityType === "post" && hasEntityId(notification)
        ? notification.entityId
        : undefined;

    // Start or navigate to chat with the collaboration requester
    startOrNavigateToChat({
      participantId: notification.actorId,
      postId: postId || undefined,
    });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <ErrorBoundary>
          <div className="flex items-center justify-center min-h-screen bg-[#f7f6f6]">
            <LoadingSpinner size={40} />
          </div>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <ErrorBoundary>
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f6f6] p-4">
            <p className="text-red-600 mb-4">Failed to load notifications</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#ffcf70] rounded-full text-black"
            >
              Retry
            </button>
          </div>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  if (!notifications) {
    return (
      <PageTransition>
        <ErrorBoundary>
          <div className="flex items-center justify-center min-h-screen bg-[#f7f6f6]">
            <p className="text-[#555555]">No notifications</p>
          </div>
        </ErrorBoundary>
      </PageTransition>
    );
  }

  // Check if there are any notifications at all
  const hasAnyNotifications =
    uniqueConnectionRequests.length > 0 ||
    sortedCollaborationRequests.length > 0 ||
    profileInteractions.length > 0 ||
    sortedMessages.length > 0;

  return (
    <PageTransition>
      <ErrorBoundary>
        <div className="min-h-screen bg-white text-foreground flex flex-col items-start  pb-24 ">
          {/* Header */}
          <div className="sticky top-0 z-40 w-full border-b border-light-grey bg-white px-4">
            <div className="flex h-12 items-center justify-between">
              <button
                onClick={handleClose}
                className="flex items-center justify-center text-foreground hover:opacity-70 transition-opacity"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <h1 className="text-sm! font-semibold text-foreground">
                Notifications
              </h1>
              <div className="w-6" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Content */}
          {hasAnyNotifications ? (
            <div className="flex flex-col gap-5 items-end px-3 w-full max-w-200 mx-auto">
              {/* Connection Requests Section */}
              {uniqueConnectionRequests.length > 0 && (
                <NotificationSection
                  title="Connection requests"
                  notifications={uniqueConnectionRequests}
                  showActionButton={true}
                  actionButtonText="Accept"
                  onActionClick={handleAcceptConnection}
                />
              )}

              {/* Collaboration Requests Section */}
              {sortedCollaborationRequests.length > 0 && (
                <NotificationSection
                  title="Collaboration requests"
                  notifications={sortedCollaborationRequests}
                  showActionButton={true}
                  actionButtonText="Reply"
                  onActionClick={handleReplyCollaboration}
                />
              )}

              {/* Profile Interactions Section */}
              {profileInteractions.length > 0 && (
                <NotificationSection
                  title="Profile interactions"
                  notifications={profileInteractions}
                />
              )}

              {/* Messages Section */}
              {sortedMessages.length > 0 && (
                <NotificationSection
                  title="Messages"
                  notifications={sortedMessages}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-12">
              <p className="text-[#555555] text-center text-base">
                No notifications yet
              </p>
              <p className="text-[#999999] text-center text-sm mt-2">
                When you receive notifications, they&apos;ll appear here
              </p>
            </div>
          )}
        </div>
        <Toaster />
      </ErrorBoundary>
    </PageTransition>
  );
}
