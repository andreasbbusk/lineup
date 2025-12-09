"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { motion } from "framer-motion";
import GlassSurface from "./glass-surface";
import { cn } from "@/app/modules/utils";
import HomeIcon from "../../../public/icons/home-icon";
import ShopIcon from "../../../public/icons/shop-icon";
import AddIcon from "../../../public/icons/add-icon";
import ChatIcon from "../../../public/icons/chat-icon";
import UserIcon from "../../../public/icons/user-icon";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "Home", icon: HomeIcon },
  { href: "/services", label: "Services", icon: ShopIcon },
  { href: "/create", label: "Create", icon: AddIcon },
  {
    href: "/chats",
    label: "Chats",
    icon: ChatIcon,
  },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on chat detail and new chat pages
  if (
    pathname === "/chats/new" ||
    (pathname?.startsWith("/chats/") && pathname !== "/chats")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-4">
      <div className="relative flex h-[69px] w-[368px] items-center justify-between rounded-[45px] bg-[#1e1e1e] px-1 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          const IconComponent = item.icon;
          const content = (
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="relative size-6">
                <IconComponent
                  className={cn(
                    "size-full",
                    isActive ? "text-crocus-yellow" : "text-white"
                  )}
                />
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ffcf70] text-[9px] font-medium leading-none text-black">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "font-['Helvetica_Now_Display'] font-medium text-[11px] leading-none tracking-[0.5px] whitespace-pre",
                  isActive ? "text-crocus-yellow" : "text-white"
                )}
              >
                {item.label}
              </span>
            </div>
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex size-16 flex-col items-center justify-center gap-1 rounded-[49px] pb-[18px] pt-[14px] px-[14px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  <GlassSurface
                    width={64}
                    height={64}
                    borderRadius={49}
                    refraction={0}
                    dispersion={0}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 pb-[18px] pt-[14px] px-[14px]"
                  />
                </motion.div>
              )}
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
