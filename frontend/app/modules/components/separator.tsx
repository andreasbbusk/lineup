"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

interface SeparatorProps {
  /**
   * The orientation of the separator
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the separator is decorative (not read by screen readers)
   * @default true
   */
  decorative?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Separator component using Radix UI
 *
 * A semantic separator that divides content sections.
 * Properly handles accessibility with ARIA attributes.
 *
 * @example
 * ```tsx
 * // Horizontal separator (default)
 * <Separator />
 *
 * // Vertical separator
 * <Separator orientation="vertical" />
 *
 * // Custom styling
 * <Separator className="my-4 bg-gray-300" />
 * ```
 */
export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ orientation = "horizontal", decorative = true, className = "", ...props }, ref) => {
  const baseStyles =
    orientation === "horizontal"
      ? "h-[0.0625rem] w-full bg-black/14"
      : "w-[0.0625rem] h-full bg-black/14";

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={`${baseStyles} ${className}`.trim()}
      {...props}
    />
  );
});

Separator.displayName = "Separator";
