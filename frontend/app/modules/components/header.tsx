"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Search, Bell, Menu } from "lucide-react";
import { useUnreadCount } from "@/app/modules/features/notifications";
import { NotificationBadge } from "./notification-badge";

export default function Header() {
	const pathname = usePathname();

	// Hide header on specific pages
	if (
		pathname === "/login" ||
		pathname?.startsWith("/onboarding") ||
		pathname === "/search" ||
		pathname?.startsWith("/chats") ||
		pathname === "/notifications" ||
		pathname === "/settings"
	) {
		return null;
	}

	const isHomePage = pathname === "/";

	if (isHomePage) {
		return <HomeHeader />;
	}

	return <DefaultHeader pathname={pathname} />;
}

/**
 * Notification button with badge
 */
function NotificationButton() {
	const { data: unreadCount } = useUnreadCount();

	return (
		<Link
			href="/notifications"
			className="relative flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
			aria-label="Notifications">
			<div className="relative">
				<Bell size={24} />
				<NotificationBadge count={unreadCount} size="xs" />
			</div>
		</Link>
	);
}

/**
 * Header icon button component
 */
function HeaderIconButton({
	icon: Icon,
	ariaLabel,
	onClick,
	href,
}: {
	icon: React.ComponentType<{ size?: number }>;
	ariaLabel: string;
	onClick?: () => void;
	href?: string;
}) {
	const className =
		"flex items-center justify-center text-grey hover:opacity-70 transition-opacity";

	if (href) {
		return (
			<Link href={href} className={className} aria-label={ariaLabel}>
				<Icon size={24} />
			</Link>
		);
	}

	return (
		<button onClick={onClick} className={className} aria-label={ariaLabel}>
			<Icon size={24} />
		</button>
	);
}

/**
 * Header variant for home/feed page
 */
function HomeHeader() {
	return (
		<header className="fixed top-0 left-0 right-0 z-40 w-full bg-white">
			<div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
				{/* Left side */}
				<div className="flex items-center">
					<Image
						src="/logos/big_logos/headerLogo.svg"
						alt="LineUp"
						width={74}
						height={24}
						priority
					/>
				</div>

				<div className="flex items-center gap-4">
					<HeaderIconButton icon={Search} ariaLabel="Search" href="/search" />
					<NotificationButton />
					<HeaderIconButton icon={Menu} ariaLabel="Menu" href="/settings" />
				</div>
			</div>
		</header>
	);
}

/**
 * Header variant for all other pages
 */
function DefaultHeader({ pathname }: { pathname?: string }) {
	const router = useRouter();

	const handleBack = () => {
		router.back();
	};

	return (
		<header
			className={`sticky top-0 z-40 w-full border-b border-light-grey ${
				pathname === "/create" ? "bg-white" : "bg-background"
			}`}>
			<div className="flex h-16 items-center justify-between px-4 sm:px-6">
				<div className="flex items-center">
					<HeaderIconButton
						icon={ChevronLeft}
						ariaLabel="Go back"
						onClick={handleBack}
					/>
				</div>
				<div className="flex-1" />
				<div className="flex items-center gap-4">
					<HeaderIconButton icon={Search} ariaLabel="Search" href="/search" />
					<NotificationButton />
					<HeaderIconButton icon={Menu} ariaLabel="Menu" href="/settings" />
				</div>
			</div>
		</header>
	);
}
