"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import type { ComponentType, SVGProps } from "react";
import { motion } from "framer-motion";
import GlassSurface from "./glass-surface";
import { cn } from "@/app/modules/utils/twUtil";
import HomeIcon from "../../../public/icons/home-icon";
import ShopIcon from "../../../public/icons/shop-icon";
import AddIcon from "../../../public/icons/add-icon";
import ChatIcon from "../../../public/icons/chat-icon";
import UserIcon from "../../../public/icons/user-icon";
import { useAppStore } from "@/app/modules/stores/Store";
import { useUnreadCount } from "@/app/modules/features/chats";
import { NotificationBadge } from "./notification-badge";

interface NavItem {
	href: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	badge?: number;
}

const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Home", icon: HomeIcon },
	{ href: "/services", label: "Services", icon: ShopIcon },
	{ href: "/create", label: "Create", icon: AddIcon },
	{
		href: "/chats",
		label: "Chats",
		icon: ChatIcon,
	},
	{ href: "/profile", label: "Profile", icon: UserIcon },
];

// Memoized glass surface for active tab indicator
const ActiveTabIndicator = memo(function ActiveTabIndicator() {
	return (
		<motion.div
			layoutId="activeTab"
			className="absolute inset-0"
			transition={{
				type: "spring",
				stiffness: 350,
				damping: 30,
			}}>
			<GlassSurface
				width={64}
				height={64}
				borderRadius={49}
				refraction={0}
				dispersion={0}
				className="flex h-full w-full flex-col items-center justify-center gap-1 pb-[18px] pt-[14px] px-[14px]"
			/>
		</motion.div>
	);
});

// Memoized nav item to prevent unnecessary re-renders
const NavItem = memo(function NavItem({
	item,
	isActive,
	badgeCount,
}: {
	item: NavItem;
	isActive: boolean;
	badgeCount?: number | null;
}) {
	const IconComponent = item.icon;

	return (
		<Link
			href={item.href}
			className="relative flex size-16 flex-col items-center justify-center gap-1 rounded-[49px] pb-[18px] pt-[14px] px-[14px]">
			{isActive && <ActiveTabIndicator />}
			<div className="relative z-10 flex flex-col items-center gap-1">
				<div className="relative size-6">
					<IconComponent
						className={cn(
							"size-full",
							isActive ? "text-crocus-yellow" : "text-white"
						)}
					/>
					{/* Use consolidated badge component with smaller size for navbar */}
					<NotificationBadge count={badgeCount} size="small" />
				</div>
				<span
					className={cn(
						"font-['Helvetica_Now_Display'] font-medium text-[11px] leading-none tracking-[0.5px] whitespace-pre",
						isActive ? "text-crocus-yellow" : "text-white"
					)}>
					{item.label}
				</span>
			</div>
		</Link>
	);
});

function BottomNav() {
	const pathname = usePathname();
	const username = useAppStore((state) => state.user?.username);
	const { data: unreadChatCount } = useUnreadCount();

	// Memoize visibility checks
	const shouldHide = useMemo(() => {
		const isAuthPage =
			pathname === "/login" || pathname?.startsWith("/onboarding");
		const isSearchPage = pathname === "/search";
		const isChatDetailPage =
			pathname === "/chats/new" ||
			(pathname?.startsWith("/chats/") && pathname !== "/chats");
		const isNotificationsPage = pathname === "/notifications";
		const isSettingsPage = pathname === "/settings";

		// Hide on edit profile page only
		// /profile or /profile/{username} = own profile (show nav)
		// /profile/otheruser = other user's profile (show nav)
		// /profile/edit = edit page (hide nav)
		const isEditProfilePage = pathname === "/profile/edit";

		return (
			isAuthPage ||
			isSearchPage ||
			isChatDetailPage ||
			isEditProfilePage ||
			isNotificationsPage ||
			isSettingsPage
		);
	}, [pathname, username]);

	// Memoize active states for all items
	const activeStates = useMemo(() => {
		return NAV_ITEMS.map(
			(item) =>
				pathname === item.href ||
				(item.href !== "/" && pathname?.startsWith(item.href))
		);
	}, [pathname]);

	if (shouldHide) {
		return null;
	}

	return (
		<>
			<nav className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-4">
				<div className="relative flex h-[69px] w-full xs:w-[368px] items-center justify-between rounded-[45px] bg-[#1e1e1e] px-1 py-3">
					{NAV_ITEMS.map((item, index) => (
						<NavItem
							key={item.href}
							item={item}
							isActive={activeStates[index]}
							badgeCount={item.href === "/chats" ? unreadChatCount : undefined}
						/>
					))}
				</div>
			</nav>
		</>
	);
}

// Memoize the entire component to prevent re-renders when parent re-renders
export default memo(BottomNav);
