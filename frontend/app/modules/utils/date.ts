/**
 * Global date and time formatting utilities
 *
 * Provides consistent date/time formatting across the application
 */

/**
 * Format a date string to relative time or absolute date
 *
 * Returns relative time for recent dates (e.g., "5m ago", "2h ago", "3d ago")
 * or absolute date for older dates (e.g., "Jan 15", "Dec 3, 2023")
 *
 * @param dateString - ISO date string to format
 * @returns Formatted time string
 *
 * @example
 * ```tsx
 * formatTimeAgo("2024-01-15T10:30:00Z") // "5m ago"
 * formatTimeAgo("2024-01-10T10:30:00Z") // "Jan 10"
 * formatTimeAgo(null) // ""
 * ```
 */
export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format service type from snake_case to readable text
 *
 * @param serviceType - Service type in snake_case
 * @returns Formatted service type
 *
 * @example
 * ```tsx
 * formatServiceType("rehearsal_space") // "rehearsal space"
 * formatServiceType("recording") // "recording"
 * ```
 */
export function formatServiceType(serviceType: string | null): string {
  if (!serviceType) return "";
  return serviceType.replace(/_/g, " ");
}

/**
 * Extract city from full location string
 *
 * @param location - Full location string (e.g., "Copenhagen, Denmark")
 * @returns City name only
 *
 * @example
 * ```tsx
 * extractCity("Copenhagen, Denmark") // "Copenhagen"
 * extractCity("New York") // "New York"
 * extractCity(null) // null
 * ```
 */
export function extractCity(location: string | null): string | null {
  if (!location) return null;
  return location.split(",")[0].trim();
}
