"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Search, Bell, Menu } from "lucide-react";
import { useUnreadCount } from "@/app/modules/features/notifications";

interface HeaderProps {
  variant?: "home" | "default";
}

/**
 * Header component with two design variants:
 * - "home": For the home/feed page
 * - "default": For all other pages
 */
export default function Header({ variant = "default" }: HeaderProps) {
  const pathname = usePathname();

  // Don't render on messenger/chats routes or notifications page (has its own header)
  if (pathname?.startsWith("/chats") || pathname === "/notifications") {
    return null;
  }

  if (variant === "home") {
    return <HomeHeader />;
  }

  return <DefaultHeader />;
}

/**
 * Header variant for home/feed page
 */
function HomeHeader() {
  const router = useRouter();
  const { data: unreadCount } = useUnreadCount();

  const handleNotificationsClick = () => {
    router.push("/notifications");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
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
          <button
            className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            <Search size={24} />
          </button>
          <button
            onClick={handleNotificationsClick}
            className="relative flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Notifications"
          >
            <Bell size={24} />
            {/* Notification badge - show when there are unread notifications */}
            {unreadCount && unreadCount > 0 && (
              <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-crocus-yellow" />
            )}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Header variant for all other pages
 */
function DefaultHeader() {
  const router = useRouter();
  const { data: unreadCount } = useUnreadCount();

  const handleBack = () => {
    router.back();
  };

  const handleNotificationsClick = () => {
    router.push("/notifications");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            <Search size={24} />
          </button>
          <button
            onClick={handleNotificationsClick}
            className="relative flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Notifications"
          >
            <Bell size={24} />
            {/* Notification badge - show when there are unread notifications */}
            {unreadCount && unreadCount > 0 && (
              <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-crocus-yellow" />
            )}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
