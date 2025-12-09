"use client";

import { Dialog, DialogContent, DialogTitle } from "@/app/components/dialog";
import { VisuallyHidden } from "@/app/components/visually-hidden";
import { useState } from "react";

// ============================================================================
// Types & Constants
// ============================================================================

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

const SIZE_CLASSES: Record<AvatarSize, string> = {
	xs: "w-5 h-5", // 20px - for post author
	sm: "w-8 h-8", // 32px - for message bubbles
	md: "w-12 h-12", // 48px - for standard UI
	lg: "size-14", // 56px - for conversation list
	xl: "w-[77px] h-[77px]", // 77px - for profile cards
	xxl: "w-36 h-36", // 144px - for profile pages
};

const TEXT_SIZE_CLASSES: Record<AvatarSize, string> = {
	xs: "text-xs",
	sm: "text-xs",
	md: "text-sm",
	lg: "text-lg",
	xl: "text-2xl",
	xxl: "text-5xl",
};

const FALLBACK_INITIAL = "?";

type AvatarProps = {
	src?: string | null;
	alt: string;
	fallback: string;
	size?: AvatarSize;
	showUnreadIndicator?: boolean;
	expandable?: boolean;
	className?: string;
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
 * Avatar component with automatic fallback, unread indicator, and fullscreen preview
 *
 * Features:
 * - Displays user profile image or fallback initials
 * - Auto-handles image load errors by switching to fallback
 * - Optional unread indicator badge
 * - Five size variants: sm (32px), md (48px), lg (56px), xl (77px), xxl (144px)
 * - Optional fullscreen preview on click
 */
export function Avatar({
	src,
	alt,
	fallback,
	size = "md",
	showUnreadIndicator = false,
	expandable = false,
	className,
}: AvatarProps) {
	const [imageError, setImageError] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	const hasImage = src && !imageError;

	return (
		<>
			<div
				className={`relative shrink-0 ${SIZE_CLASSES[size]} ${
					expandable && hasImage ? "cursor-pointer" : ""
				} ${className || ""}`}
				onClick={
					expandable && hasImage ? () => setIsExpanded(true) : undefined
				}>
				{hasImage ? (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={src}
						alt={alt}
						className="size-full rounded-full object-cover"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="size-full rounded-full bg-light-grey flex items-center justify-center">
						<span
							className={`text-grey font-medium ${TEXT_SIZE_CLASSES[size]}`}>
							{fallback}
						</span>
					</div>
				)}
				{showUnreadIndicator && (
					<div className="absolute top-0 right-0 size-3.5 bg-crocus-yellow rounded-full border-2 border-white" />
				)}
			</div>

			{expandable && hasImage && (
				<Dialog open={isExpanded} onOpenChange={setIsExpanded}>
					<DialogContent className="max-w-2xl px-8 py-0 bg-transparent border-none shadow-none">
						<VisuallyHidden>
							<DialogTitle>{alt}</DialogTitle>
						</VisuallyHidden>
						<div
							className="aspect-square max-w-2xl mx-auto cursor-pointer rounded-full overflow-hidden"
							onClick={() => setIsExpanded(false)}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={src} alt={alt} className="size-full object-cover" />
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
