import * as React from "react";

/**
 * VisuallyHidden component for hiding content visually while keeping it accessible to screen readers
 *
 * Use cases:
 * - Hide labels that are visually redundant but needed for screen readers
 * - Hide dialog titles that aren't needed visually
 * - Provide context for icon-only buttons
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  );
}
