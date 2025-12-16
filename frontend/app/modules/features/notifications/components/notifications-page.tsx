"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationSection } from "./notification-section";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import type { NotificationResponse } from "../types";
import { useAcceptConnection } from "@/app/modules/hooks/mutations/useConnectionMutations";
import { useMarkAsRead } from "../hooks/useNotificationMutations";
import { deduplicateConnectionRequests } from "../utils/connectionRequests";
import { useStartOrNavigateToChat } from "@/app/modules/hooks";
import { useAppStore } from "@/app/modules/stores/Store";

/**
 * Main notifications page component
 * Displays notifications grouped by type: Connection requests, Collaboration requests, and Profile interactions
 */
export function NotificationsPage() {
	const router = useRouter();
	const { data, isLoading, error } = useNotifications();
	const acceptConnection = useAcceptConnection();
	const markAsRead = useMarkAsRead();
	const user = useAppStore((state) => state.user);
	const { startOrNavigateToChat } = useStartOrNavigateToChat();

	const notifications = data?.notifications;

	const connectionRequests = notifications
		? [
				...notifications.connection_request,
				...notifications.connection_accepted,
		  ]
		: [];

	const uniqueConnectionRequests = deduplicateConnectionRequests(
		connectionRequests
	).sort((a, b) => {
		// Sort by createdAt descending (newest first)
		const dateA = new Date(a.createdAt).getTime();
		const dateB = new Date(b.createdAt).getTime();
		return dateB - dateA;
	});

	// Profile interactions: likes, comments, tagged_in_post, review
	const profileInteractions = notifications
		? [
				...notifications.like,
				...notifications.comment,
				...notifications.tagged_in_post,
				...notifications.review,
		  ].sort((a, b) => {
				// Sort by createdAt descending (newest first)
				const dateA = new Date(a.createdAt).getTime();
				const dateB = new Date(b.createdAt).getTime();
				return dateB - dateA;
		  })
		: [];

	// Sort collaboration requests by createdAt descending (newest first)
	const sortedCollaborationRequests = notifications
		? [...notifications.collaboration_request].sort((a, b) => {
				const dateA = new Date(a.createdAt).getTime();
				const dateB = new Date(b.createdAt).getTime();
				return dateB - dateA;
		  })
		: [];

	// Sort messages by createdAt descending (newest first)
	const sortedMessages = notifications
		? [...notifications.message].sort((a, b) => {
				const dateA = new Date(a.createdAt).getTime();
				const dateB = new Date(b.createdAt).getTime();
				return dateB - dateA;
		  })
		: [];

	const handleClose = () => {
		router.back();
	};

	// Handle connection request accept
	const handleAcceptConnection = (notification: NotificationResponse) => {
		if (!notification.entityId) {
			console.error("Notification missing connection request ID");
			return;
		}

		// Accept the connection request
		acceptConnection.mutate(notification.entityId, {
			onSuccess: () => {
				// Mark notification as read after successful acceptance
				if (notification.id) {
					markAsRead.mutate({
						notificationId: notification.id,
						isRead: true,
					});
				}
			},
			onError: (error) => {
				console.error("Failed to accept connection:", error);
			},
		});
	};

	// Handle collaboration request reply
	const handleReplyCollaboration = (notification: NotificationResponse) => {
		if (!user || !notification.actorId) return;

		// Mark notification as read
		if (notification.id && !notification.isRead) {
			markAsRead.mutate({
				notificationId: notification.id,
				isRead: true,
			});
		}

		// Get the post ID from the notification entity
		const postId =
			notification.entityType === "post" ? notification.entityId : undefined;

		// Start or navigate to chat with the collaboration requester
		startOrNavigateToChat({
			participantId: notification.actorId,
			postId: postId || undefined,
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#f7f6f6]">
				<LoadingSpinner size={40} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f6f6] p-4">
				<p className="text-red-600 mb-4">Failed to load notifications</p>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-[#ffcf70] rounded-full text-black">
					Retry
				</button>
			</div>
		);
	}

	if (!notifications) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#f7f6f6]">
				<p className="text-[#555555]">No notifications</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white text-foreground flex flex-col items-start  pb-24 ">
			{/* Header */}
			<div className="sticky top-0 z-40 w-full border-b border-light-grey bg-white px-4">
				<div className="flex h-12 items-center justify-between">
					<button
						onClick={handleClose}
						className="flex items-center justify-center text-foreground hover:opacity-70 transition-opacity"
						aria-label="Close">
						<X size={18} />
					</button>
					<h1 className="text-sm! font-semibold text-foreground">
						Notifications
					</h1>
					<div className="w-6" /> {/* Spacer for centering */}
				</div>
			</div>

			{/* Content */}
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
		</div>
	);
}
