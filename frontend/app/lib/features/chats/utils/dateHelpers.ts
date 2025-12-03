// lib/features/chats/utils/dateHelpers.ts

/**
 * Format a timestamp for chat message display
 * Returns "Just now", "Xm ago", "Xh ago", "Yesterday", or "MM/DD/YY"
 */
export function formatMessageTime(timestamp: string | null): string {
  if (!timestamp) return "";

  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";

  // Format as MM/DD/YY for older messages
  const month = String(messageDate.getMonth() + 1).padStart(2, "0");
  const day = String(messageDate.getDate()).padStart(2, "0");
  const year = String(messageDate.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

/**
 * Format timestamp for conversation list preview
 * Returns "Now", "Xm", "Xh", "Yesterday", or "MM/DD"
 */
export function formatConversationTime(timestamp: string | null): string {
  if (!timestamp) return "";

  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays === 1) return "Yesterday";

  // Format as MM/DD for older messages
  const month = String(messageDate.getMonth() + 1).padStart(2, "0");
  const day = String(messageDate.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

/**
 * Format full timestamp for message bubbles
 * Returns time in "HH:MM AM/PM" format
 */
export function formatFullTime(timestamp: string | null): string {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Truncate message content for preview
 */
export function truncateMessage(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
}
