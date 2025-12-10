"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNotificationTime } from "../utils/formatTime";
import { getNotificationText } from "../utils/notificationText";
import type { NotificationResponse } from "../types";
import { useMarkAsRead } from "../hooks/useNotificationMutations";
import { Heart, Repeat2 } from "lucide-react";

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
  const markAsRead = useMarkAsRead();
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

  // Handle notification click - mark as read
  const handleClick = () => {
    if (!notification.isRead && notification.id) {
      markAsRead.mutate({
        notificationId: notification.id,
        isRead: true,
      });
    }
  };

  // Memoize preview content based on notification type
  const previewContent = useMemo(() => {
    if (notification.type === "like" && notification.entityType === "post") {
      return (
        <div className="flex items-center justify-center px-[2px] py-[3px]">
          <Heart size={16} className="text-[#ffcf70] fill-[#ffcf70]" />
        </div>
      );
    }
    if (notification.type === "like" && notification.entityType === "story") {
      // Show story preview thumbnail if available
      return (
        <div className="relative rounded-[6.811px] size-[28px] bg-gray-200">
          {notification.actionUrl && (
            <Image
              src={notification.actionUrl}
              alt="Story preview"
              fill
              className="rounded-[6.811px] object-cover"
            />
          )}
        </div>
      );
    }
    // For repost (if we add that type later)
    if (notification.type === "comment") {
      return (
        <div className="flex items-center justify-center px-[3px] py-[2px]">
          <Repeat2 size={16} className="text-[#ffcf70]" />
        </div>
      );
    }
    return null;
  }, [notification.type, notification.entityType, notification.actionUrl]);

  return (
    <div
      className={`flex items-start justify-between gap-2 w-full ${
        !notification.isRead ? "bg-gray-50" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-1 gap-2 items-center min-w-0">
        {/* Avatar */}
        <div className="relative shrink-0 size-[28px] rounded-full overflow-hidden">
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
            <span className="font-['Helvetica_Now_Display',sans-serif] font-bold text-[#1e1e1e]">
              {actorName}
            </span>
            <span className="font-['Helvetica_Now_Display',sans-serif] font-medium text-[#1e1e1e]">
              {notificationText}
            </span>
            {timeAgo && (
              <span className="font-['Helvetica_Now_Display',sans-serif] font-normal text-[12px] text-[#555555] leading-none">
                {timeAgo}
              </span>
            )}
          </div>

          {/* Body text (for collaboration requests, comments, etc.) */}
          {notification.body && (
            <p className="font-['Helvetica_Now_Display',sans-serif] font-medium text-[14px] text-[#555555] leading-[1.35] tracking-[0.5px]">
              {notification.body}
            </p>
          )}

          {/* Preview text for posts (e.g., "Having a blast on stage... See note") */}
          {notification.type === "like" &&
            notification.entityType === "post" &&
            notification.body && (
              <div className="flex gap-2 items-start text-[14px] leading-[1.35] tracking-[0.5px]">
                <span className="font-['Helvetica_Now_Display',sans-serif] font-medium text-[#555555]">
                  {notification.body}
                </span>
                {notification.actionUrl && (
                  <Link
                    href={notification.actionUrl}
                    className="font-['Helvetica_Now_Display',sans-serif] font-bold text-[12px] text-[#1e1e1e] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    See note
                  </Link>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Preview image/icon or action button */}
      <div className="flex items-center gap-2 shrink-0">
        {previewContent && <div>{previewContent}</div>}
        {showActionButton && actionButtonText && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick?.();
            }}
            className="bg-[#ffcf70] cursor-pointer flex items-center justify-end px-[10px] py-[4px] rounded-[400px] shrink-0 hover:opacity-90 transition-opacity"
          >
            <span className="font-['Helvetica_Now_Display',sans-serif] font-medium text-[14px] text-black text-center tracking-[0.5px]">
              {actionButtonText}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

