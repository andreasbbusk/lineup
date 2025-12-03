import type { ReactNode } from "react";
import BottomNav from "@/app/components/bottom-nav";

interface MainLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      <BottomNav />
    </div>
  );
}
