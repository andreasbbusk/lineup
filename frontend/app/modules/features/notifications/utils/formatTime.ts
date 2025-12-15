/**
 * Format notification timestamp to relative time
 * Returns format like "3h", "1d", "1w", "2w"
 */
export function formatNotificationTime(timestamp: string | null): string {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  const weeks = Math.floor(diffInSeconds / 604800);
  return `${weeks}w`;
}

