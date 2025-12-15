"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";

interface BookmarkButtonProps {
  /**
   * Whether the item is bookmarked (controlled mode)
   */
  isBookmarked?: boolean;
  /**
   * Callback when bookmark state changes (controlled mode)
   */
  onToggle?: (bookmarked: boolean) => void;
  /**
   * Default bookmarked state (uncontrolled mode)
   * @default false
   */
  defaultBookmarked?: boolean;
  /**
   * Optional aria-label for accessibility
   * @default "Toggle bookmark"
   */
  ariaLabel?: string;
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * Size of the bookmark icon
   * @default 20
   */
  size?: number;
}

/**
 * BookmarkButton - Toggleable bookmark component using Radix UI
 *
 * Supports both controlled and uncontrolled modes.
 * Handles click event propagation for use within clickable cards.
 *
 * @example
 * ```tsx
 * // Uncontrolled (manages its own state)
 * <BookmarkButton />
 * <BookmarkButton defaultBookmarked />
 *
 * // Controlled (parent manages state)
 * const [bookmarked, setBookmarked] = useState(false);
 * <BookmarkButton isBookmarked={bookmarked} onToggle={setBookmarked} />
 * ```
 */
export const BookmarkButton = React.forwardRef<
  HTMLButtonElement,
  BookmarkButtonProps
>(
  (
    {
      isBookmarked,
      onToggle,
      defaultBookmarked = false,
      ariaLabel = "Toggle bookmark",
      className = "",
      size = 20,
      ...props
    },
    ref
  ) => {
    const [internalBookmarked, setInternalBookmarked] =
      React.useState(defaultBookmarked);

    // Use controlled state if provided, otherwise use internal state
    const isControlled = isBookmarked !== undefined;
    const bookmarked = isControlled ? isBookmarked : internalBookmarked;

    const handlePressedChange = (pressed: boolean) => {
      if (isControlled) {
        onToggle?.(pressed);
      } else {
        setInternalBookmarked(pressed);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      // Prevent navigation and stop event bubbling to parent card
      e.preventDefault();
      e.stopPropagation();
    };

    return (
      <TogglePrimitive.Root
        ref={ref}
        pressed={bookmarked}
        onPressedChange={handlePressedChange}
        onClick={handleClick}
        aria-label={ariaLabel}
        className={`hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blackberry-harvest rounded ${className}`.trim()}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-colors"
        >
          <path
            d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L13.0815 17.1953C12.4227 16.7717 11.5773 16.7717 10.9185 17.1953L5 21Z"
            stroke="currentColor"
            fill={bookmarked ? "black" : "none"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </TogglePrimitive.Root>
    );
  }
);

BookmarkButton.displayName = "BookmarkButton";
