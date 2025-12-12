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

  // Hide header and bottom nav on search page
  const isSearchPage = pathname === "/search";

  return (
    <div className="">
      {!isSearchPage && <Header variant={headerVariant} />}
      <div className="">{children}</div>
      {!isSearchPage && <BottomNav />}
    </div>
  );
}
