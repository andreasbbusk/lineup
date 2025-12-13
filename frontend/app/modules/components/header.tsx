"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Search, Bell, Menu } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide header on specific pages
  if (
    pathname === "/login" ||
    pathname?.startsWith("/onboarding") ||
    pathname === "/search" ||
    pathname?.startsWith("/chats")
  ) {
    return null;
  }

  const isHomePage = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center">
          {isHomePage ? (
            <Image
              src="/logos/big_logos/headerLogo.svg"
              alt="LineUp"
              width={74}
              height={24}
              priority
            />
          ) : (
            <button
              // Edge case using router.back() -> Would navigate back to external site if that was the access point.
              // Minor thing, but important to note.
              onClick={() => {
                router.back();
              }}
              className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        {/* Spacer for non-home pages */}
        {!isHomePage && <div className="flex-1" />}

        {/* Right side - identical for both variants */}
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            <Search size={24} />
          </Link>
          <button
            className="relative flex h-10 w-10 items-center justify-center text-grey hover:opacity-70 transition-opacity"
            aria-label="Notifications"
          >
            <Bell size={24} />
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
