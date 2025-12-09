"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import BottomNav from "@/app/components/bottom-nav";
import Header from "@/app/components/header";

interface MainLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Determine header variant based on route
  const isHomePage = pathname === "/feed";
  const headerVariant = isHomePage ? "home" : "default";

  return (
    <div className="">
      <Header variant={headerVariant} />
      <div className="">{children}</div>
      <BottomNav />
    </div>
  );
}
