import type { ReactNode } from "react";
import BottomNav from "@/app/components/bottom-nav";

interface MainLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="">{children}</div>
      <BottomNav />
    </div>
  );
}
