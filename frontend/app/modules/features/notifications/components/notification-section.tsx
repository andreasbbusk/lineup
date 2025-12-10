"use client";

import { NotificationItem } from "./notification-item";
import type { NotificationResponse } from "../types";

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
    <div className="flex flex-col gap-5 items-start w-full">
      {/* Section title */}
      <h2 className="font-['Helvetica_Now_Display',sans-serif] font-medium text-[12px] text-[#555555] leading-none tracking-[0.5px] w-full">
        {title}
      </h2>

      {/* Notification items */}
      <div className="flex flex-col gap-4 items-start w-full">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            showActionButton={showActionButton}
            actionButtonText={actionButtonText}
            onActionClick={() => onActionClick?.(notification)}
          />
        ))}
      </div>
    </div>
  );
}

