"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Search, Bell, Menu } from "lucide-react";
import { useUnreadCount } from "@/app/modules/features/notifications";

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

  return <DefaultHeader />;
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
      aria-label="Notifications"
    >
      <Bell size={24} />
      {/* Notification badge - show when there are unread notifications */}
      {unreadCount && unreadCount > 0 && (
        <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-crocus-yellow" />
      )}
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
    "flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity";

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
    <header className="sticky top-0 z-40 w-full bg-background">
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
function DefaultHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
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
