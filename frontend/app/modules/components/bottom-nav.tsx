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
import { useUnreadCount } from "@/app/modules/features/chats/hooks/query/conversations";

interface NavItem {
	href: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	badge?: number;
}

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
}: {
	item: NavItem;
	isActive: boolean;
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
					{item.badge !== undefined && item.badge > 0 && (
						<span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ffcf70] text-[9px] font-medium leading-none text-black">
							{item.badge > 99 ? "99+" : item.badge}
						</span>
					)}
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

	// Only fetch unread count if user is logged in
	const { data: unreadCount } = useUnreadCount();

	// Memoize navigation items with dynamic badge
	const navItems = useMemo<NavItem[]>(
		() => [
			{ href: "/", label: "Home", icon: HomeIcon },
			{ href: "/services", label: "Services", icon: ShopIcon },
			{ href: "/create", label: "Create", icon: AddIcon },
			{
				href: "/chats",
				label: "Chats",
				icon: ChatIcon,
				badge: unreadCount ?? undefined,
			},
			{ href: "/profile", label: "Profile", icon: UserIcon },
		],
		[unreadCount]
	);

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

		// Hide on other users' profiles and edit profile page
		// /profile or /profile/{username} = own profile (show nav)
		// /profile/otheruser = other user's profile (hide nav)
		// /profile/edit = edit page (hide nav)
		const isOtherUsersProfile =
			pathname?.startsWith("/profile/") && pathname !== `/profile/${username}`;

		return (
			isAuthPage ||
			isSearchPage ||
			isChatDetailPage ||
			isOtherUsersProfile ||
			isNotificationsPage ||
			isSettingsPage
		);
	}, [pathname, username]);

	// Memoize active states for all items
	const activeStates = useMemo(() => {
		return navItems.map(
			(item) =>
				pathname === item.href ||
				(item.href !== "/" && pathname?.startsWith(item.href))
		);
	}, [pathname, navItems]);

	if (shouldHide) {
		return null;
	}

	return (
		<>
			<nav className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-4">
				<div className="relative flex h-[69px] w-full xs:w-[368px] items-center justify-between rounded-[45px] bg-[#1e1e1e] px-1 py-3">
					{navItems.map((item, index) => (
						<NavItem
							key={item.href}
							item={item}
							isActive={activeStates[index]}
						/>
					))}
				</div>
			</nav>
		</>
	);
}

// Memoize the entire component to prevent re-renders when parent re-renders
export default memo(BottomNav);
