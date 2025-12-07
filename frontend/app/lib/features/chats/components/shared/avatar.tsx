"use client";

// TODO: Match with global avatar component when available

import { useState } from "react";

// ============================================================================
// Types & Constants
// ============================================================================

type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "w-8 h-8", // 32px - for message bubbles
  md: "w-12 h-12", // 48px - for standard UI
  lg: "size-14", // 56px - for conversation list
};

const TEXT_SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
};

const FALLBACK_INITIAL = "?";

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: AvatarSize;
  showUnreadIndicator?: boolean;
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract initials from first and last name
 * Returns "??" if both names are missing
 *
 * @example getInitials("John", "Doe") // "JD"
 * @example getInitials(null, "Smith") // "?S"
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.charAt(0).toUpperCase() || FALLBACK_INITIAL;
  const last = lastName?.charAt(0).toUpperCase() || FALLBACK_INITIAL;
  return `${first}${last}`;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Avatar component with automatic fallback and unread indicator
 *
 * Features:
 * - Displays user profile image or fallback initials
 * - Auto-handles image load errors by switching to fallback
 * - Optional unread indicator badge
 * - Three size variants: sm (32px), md (48px), lg (56px)
 */
export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  showUnreadIndicator = false,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative shrink-0 ${SIZE_CLASSES[size]}`}>
      {src && !imageError ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className="size-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="size-full rounded-full bg-light-grey flex items-center justify-center">
          <span className={`text-grey font-medium ${TEXT_SIZE_CLASSES[size]}`}>
            {fallback}
          </span>
        </div>
      )}
      {showUnreadIndicator && (
        <div className="absolute top-0 right-0 size-3.5 bg-crocus-yellow rounded-full border-2 border-white" />
      )}
    </div>
  );
}
