"use client";

import { NotificationItem } from "./notification-item";
import type { NotificationResponse } from "../types";
import { shouldShowActionButton } from "../utils/notificationHelpers";

interface NotificationSectionProps {
	title: string;
	notifications: NotificationResponse[];
	showActionButton?: boolean;
	actionButtonText?: string;
	onActionClick?: (notification: NotificationResponse) => void;
}

/**
 * Section component for grouping notifications by type
 * Displays a section title and list of notifications
 */
export function NotificationSection({
	title,
	notifications,
	showActionButton = false,
	actionButtonText,
	onActionClick,
}: NotificationSectionProps) {
	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-3.75 items-start w-full">
			{/* Section title */}
			<h2 className="text-[12px]! font-medium text-[#555555] w-full">
				{title}
			</h2>

			{/* Notification items */}
			<div className="flex flex-col gap-2 items-start w-full">
				{notifications.map((notification) => {
					const itemShowAction =
						showActionButton && shouldShowActionButton(notification);

					return (
						<NotificationItem
							key={notification.id}
							notification={notification}
							showActionButton={itemShowAction}
							actionButtonText={actionButtonText}
							onActionClick={() => onActionClick?.(notification)}
						/>
					);
				})}
			</div>
		</div>
	);
}
