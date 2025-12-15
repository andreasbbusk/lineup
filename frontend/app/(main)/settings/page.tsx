"use client";

import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  Sparkles,
  Bookmark,
  BarChart3,
  Users,
  Star,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/app/modules/features/auth";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

/**
 * Menu page matching Figma design
 * Light background with dark text and icons
 */
export default function SettingsPage() {
  const router = useRouter();
  const logout = useLogout();

  const menuItems: MenuItem[] = [
    {
      icon: <Sparkles size={20} />,
      label: "Get Pro lineUp",
      onClick: () => {
        // TODO: Navigate to Pro upgrade page
        // router.push("/pro");
      },
    },
    {
      icon: <Bookmark size={20} />,
      label: "Saved",
      onClick: () => {
        // TODO: Navigate to saved posts/bookmarks page
        // router.push("/saved");
      },
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Insights",
      onClick: () => {
        // TODO: Navigate to insights/analytics page
        // router.push("/insights");
      },
    },
    {
      icon: <Users size={20} />,
      label: "Invite friends",
      onClick: () => {
        // TODO: Navigate to invite friends page
        // router.push("/invite");
      },
    },
    {
      icon: <Star size={20} />,
      label: "Rate the app",
      onClick: () => {
        // TODO: Open app store rating page
        // window.open("app-store-url");
      },
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      onClick: () => {
        // TODO: Navigate to settings page
        // router.push("/settings/detailed");
      },
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Help",
      onClick: () => {
        // TODO: Navigate to help page
        // router.push("/help");
      },
    },
    {
      icon: <LogOut size={20} />,
      label: "Log out",
      onClick: () => logout.mutate(),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-light-grey bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center text-foreground hover:opacity-70 transition-opacity"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Menu</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-0">
          {menuItems.map((item) => {
            const isLogout = item.label === "Log out";
            const content = (
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={`text-foreground ${isLogout ? "text-red-600" : ""}`}>
                    {item.icon}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isLogout ? "text-red-600" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className={isLogout ? "text-maroon" : "text-grey"}
                />
              </div>
            );

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full text-left transition-colors cursor-pointer ${
                  isLogout
                    ? "hover:bg-red-50"
                    : "hover:bg-light-grey/30"
                }`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
