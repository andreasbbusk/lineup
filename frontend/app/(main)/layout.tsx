"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import BottomNav from "@/app/modules/components/bottom-nav";
import Header from "@/app/modules/components/header";

interface MainLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Determine header variant based on route
  const isHomePage = pathname === "/feed";
  const headerVariant = isHomePage ? "home" : "default";

  // Hide header on settings page (it has its own header)
  const shouldShowHeader = !pathname?.startsWith("/settings");

  return (
    <div className="">
      {shouldShowHeader && <Header variant={headerVariant} />}
      <div className="">{children}</div>
      <BottomNav />
    </div>
  );
}
