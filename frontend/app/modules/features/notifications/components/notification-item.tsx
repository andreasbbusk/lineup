"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatNotificationTime } from "../utils/formatTime";
import { getNotificationText } from "../utils/notificationText";
import type { NotificationResponse } from "../types";
import { useMarkAsRead, useDeleteNotification } from "../hooks/useNotificationMutations";
import { FileText, Tag, X } from "lucide-react";
import {
	getStoryImageUrl,
	isStoryNotification,
	shouldNavigateToPost,
} from "../utils/notificationHelpers";
import { StoryPreview } from "./StoryPreview";
import {
	NOTIFICATION_FONTS,
	NOTIFICATION_COLORS,
} from "../utils/notificationConstants";
import { Avatar, getInitials } from "@/app/modules/components/avatar";

interface NotificationItemProps {
	notification: NotificationResponse;
	showActionButton?: boolean;
	actionButtonText?: string;
	onActionClick?: () => void;
}

/**
 * Individual notification item component
 * Displays avatar, user name, action text, timestamp, and optional action button
 */
export function NotificationItem({
	notification,
	showActionButton = false,
	actionButtonText,
	onActionClick,
}: NotificationItemProps) {
	const router = useRouter();
	const markAsRead = useMarkAsRead();
	const deleteNotification = useDeleteNotification();
	const actor = notification.actor;

	// Memoize computed values
	const actorName = useMemo(
		() =>
			actor
				? `${actor.firstName || ""} ${actor.lastName || ""}`.trim() ||
				  actor.username
				: "Someone",
		[actor]
	);

	const notificationText = useMemo(
		() => getNotificationText(notification),
		[notification]
	);

	const timeAgo = useMemo(
		() => formatNotificationTime(notification.createdAt),
		[notification.createdAt]
	);

	const targetUrl =
		notification.actionUrl ||
		(notification.entityType === "post" && notification.entityId
			? `/posts/${notification.entityId}`
			: undefined);

	// Helper to mark notification as read
	const markAsReadIfNeeded = () => {
		if (!notification.isRead && notification.id) {
			markAsRead.mutate({
				notificationId: notification.id,
				isRead: true,
			});
		}
	};

	const handleAvatarClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!actor?.username) return;

		markAsReadIfNeeded();
		router.push(`/profile/${actor.username}`);
	};

	// Handle notification click - mark as read and navigate to target if available
	const handleClick = () => {
		markAsReadIfNeeded();

		// Navigate to related entity for post interactions
		if (targetUrl && shouldNavigateToPost(notification)) {
			router.push(targetUrl);
		}
	};

	// Handle delete button click
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (notification.id) {
			deleteNotification.mutate(notification.id);
		}
	};

	// Memoize preview content based on notification type and post type
	// Don't show preview content if there's an action button (for collaboration/connection requests)
	const previewContent = useMemo(() => {
		// Don't show icon/preview if there's an action button
		if (showActionButton) {
			return null;
		}

		const isStory = isStoryNotification(notification);
		const imageUrl = getStoryImageUrl(notification);

		// Likes: show heart icon for notes/posts, image for stories
		if (notification.type === "like") {
			if (isStory && imageUrl) {
				return <StoryPreview imageUrl={imageUrl} />;
			}
			// Heart icon for notes/posts
			return (
				<div className="flex items-center justify-center size-7 shrink-0">
					<Image
						src="/icons/likeHeart.svg"
						alt="Like"
						width={16}
						height={15}
						className="shrink-0"
					/>
				</div>
			);
		}

		// Comments: show note icon for notes, story image for stories
		if (notification.type === "comment") {
			if (isStory && imageUrl) {
				return <StoryPreview imageUrl={imageUrl} />;
			}
			// Note icon for notes
			return (
				<div className="flex items-center justify-center size-7 shrink-0">
					<FileText size={16} className={NOTIFICATION_COLORS.yellow} />
				</div>
			);
		}

		// Tagged in post: show tag icon for notes, story image for stories
		if (notification.type === "tagged_in_post") {
			if (isStory && imageUrl) {
				return <StoryPreview imageUrl={imageUrl} />;
			}
			// Tag icon for notes
			return (
				<div className={`flex items-center justify-center size-7 shrink-0 `}>
					<Tag size={16} className={NOTIFICATION_COLORS.yellow} />
				</div>
			);
		}

		return null;
	}, [notification, showActionButton]);

	return (
		<div
			className={`flex items-start justify-between gap-2 w-full ${
				notification.isRead ? "opacity-60" : ""
			}`}
			onClick={handleClick}>
			<div className="flex flex-1 gap-2 items-center min-w-0">
				{/* Avatar */}
				<div
					className="relative shrink-0 size-7 rounded-full overflow-hidden cursor-pointer"
					onClick={handleAvatarClick}>
					{actor?.avatarUrl ? (
						<Image
							src={actor.avatarUrl}
							alt={actorName}
							fill
							className="object-cover rounded-full"
						/>
					) : (
						<div className="w-full h-full bg-gray-300 rounded-full" />
					)}
				</div>

				{/* Notification text */}
				<div className="flex flex-1 flex-col gap-1 items-start justify-center min-w-0">
					<div className="flex flex-wrap gap-1 items-center text-[14px] leading-[1.35] tracking-[0.5px]">
						<span
							className={`${NOTIFICATION_FONTS.bold} ${NOTIFICATION_COLORS.foreground}`}>
							{actorName}
						</span>
						<span
							className={`${NOTIFICATION_FONTS.medium} ${NOTIFICATION_COLORS.foreground}`}>
							{notificationText}
						</span>
						{timeAgo && (
							<span
								className={`${NOTIFICATION_FONTS.normal} text-[12px] ${NOTIFICATION_COLORS.muted} leading-none`}>
								{timeAgo}
							</span>
						)}
					</div>

					{/* Body text (for collaboration requests, comments, etc.) */}
					{notification.body && (
						<p
							className={`${NOTIFICATION_FONTS.medium} text-[14px] ${NOTIFICATION_COLORS.muted} leading-[1.35] tracking-[0.5px]`}>
							{notification.body}
						</p>
					)}

					{/* Preview text for posts (e.g., "Having a blast on stage... See note") */}
					{notification.type === "like" &&
						notification.entityType === "post" &&
						notification.body && (
							<div className="flex gap-2 items-start text-[14px] leading-[1.35] tracking-[0.5px]">
								<span
									className={`${NOTIFICATION_FONTS.medium} ${NOTIFICATION_COLORS.muted}`}>
									{notification.body}
								</span>
								{notification.actionUrl && (
									<Link
										href={notification.actionUrl}
										className={`${NOTIFICATION_FONTS.bold} text-[14px] ${NOTIFICATION_COLORS.foreground} hover:underline`}
										onClick={(e) => e.stopPropagation()}>
										See note
									</Link>
								)}
							</div>
						)}
				</div>
			</div>

			{/* Preview image/icon, action button, or delete button */}
			<div className="flex items-center gap-2 shrink-0">
				{previewContent}
				{/* Only show action button if notification is not read */}
				{showActionButton && actionButtonText && !notification.isRead && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onActionClick?.();
						}}
						className="bg-[#ffcf70] cursor-pointer flex items-center justify-end px-[10px] py-[4px] rounded-[400px] shrink-0 hover:opacity-90 transition-opacity">
						<span
							className={`${NOTIFICATION_FONTS.medium} text-[14px] text-black text-center tracking-[0.5px]`}>
							{actionButtonText}
						</span>
					</button>
				)}
				{/* Delete button (X) */}
				<button
					onClick={handleDelete}
					className="flex items-center justify-center size-6 shrink-0 text-grey hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
					aria-label="Delete notification">
					<X size={14} />
				</button>
			</div>
		</div>
	);
}
