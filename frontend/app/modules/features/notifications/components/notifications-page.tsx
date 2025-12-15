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

/**
 * Main notifications page component
 * Displays notifications grouped by type: Connection requests, Collaboration requests, and Profile interactions
 */
export function NotificationsPage() {
	const router = useRouter();
	const { data, isLoading, error } = useNotifications();
	const acceptConnection = useAcceptConnection();
	const markAsRead = useMarkAsRead();

	const notifications = data?.notifications;

	const connectionRequests = notifications
		? [
				...notifications.connection_request,
				...notifications.connection_accepted,
		  ]
		: [];

	const uniqueConnectionRequests =
		deduplicateConnectionRequests(connectionRequests);

	// Profile interactions: likes, comments, tagged_in_post, review
	const profileInteractions = notifications
		? [
				...notifications.like,
				...notifications.comment,
				...notifications.tagged_in_post,
				...notifications.review,
		  ]
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
		// TODO: Implement collaboration reply logic
		console.log("Reply to collaboration", notification);
		// This should navigate to collaboration or open a reply modal
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
		<div className="min-h-screen bg-[background pb-20">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-[#f7f6f6] border-b border-[#eae7e5]">
				<div className="flex items-center justify-between px-4 py-2">
					<button
						onClick={handleClose}
						className="flex items-center justify-center size-6 text-[#1e1e1e] hover:opacity-70 transition-opacity"
						aria-label="Close">
						<X size={24} />
					</button>
					<h1 className=" text-black tracking-[0.5px]">Notifications</h1>
					<div className="w-6" /> {/* Spacer for centering */}
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-5 items-end px-3 py-6 max-w-200 mx-auto">
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
				{notifications.collaboration_request.length > 0 && (
					<NotificationSection
						title="Collaboration requests"
						notifications={notifications.collaboration_request}
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
				{notifications.message.length > 0 && (
					<NotificationSection
						title="Messages"
						notifications={notifications.message}
					/>
				)}
			</div>
		</div>
	);
}
