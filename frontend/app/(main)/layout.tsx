import type { ReactNode } from "react";
import BottomNav from "@/app/components/bottom-nav";

interface MainLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: MainLayoutProps) {
  return (
    <div className="">
      <div className="">{children}</div>
      <BottomNav />
    </div>
  );
}
