"use client";

interface NotificationBadgeProps {
	count: number | undefined | null;
	className?: string;
	size?: "default" | "small" | "xs";
}

/**
 * Reusable notification badge component
 * Shows a count badge when count > 0
 * Displays "9+" for counts exceeding 9
 * Only renders when count is greater than 0
 */
export function NotificationBadge({
	count,
	className = "",
	size = "default",
}: NotificationBadgeProps) {
	// Only show badge when count is greater than 0
	const showBadge = typeof count === "number" && count > 0;
	// Format count: show "9+" if count exceeds 9
	const displayCount = showBadge ? (count > 9 ? "9+" : count.toString()) : null;

	if (!showBadge) {
		return null;
	}

	// Size variants
	const sizeClasses =
		size === "xs"
			? "min-w-[14px] h-[14px] text-[8px]"
			: size === "small"
			? "min-w-[16px] h-[16px] text-[9px]"
			: "min-w-[16px] h-[16px] text-[9px]"; // Default size

	return (
		<span
			className={`absolute -right-0.5 -top-0.5 flex ${sizeClasses} items-center justify-center rounded-full bg-crocus-yellow ${className}`}>
			<span className="font-semibold leading-none text-black text-center">
				{displayCount}
			</span>
		</span>
	);
}
