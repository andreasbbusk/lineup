/**
 * Shared utility functions for search feature
 */

/**
 * Format date to relative time string or absolute date
 */
export function formatDate(dateString: string): string {
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
 */
export function formatServiceType(serviceType: string | null): string {
  if (!serviceType) return "";
  return serviceType.replace(/_/g, " ");
}

/**
 * Extract city from full location string
 */
export function extractCity(location: string | null): string | null {
  if (!location) return null;
  return location.split(",")[0].trim();
}

/**
 * Get category label for search result entity type
 */
export function getCategoryLabel(entityType: string): string {
  const labels: Record<string, string> = {
    user: "People",
    collaboration: "Collaborations",
    service: "Services",
    tag: "Tags",
  };
  return labels[entityType] || entityType;
}
