"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../../../stores/app-store";

export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Allow the store to hydrate from localStorage first
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    }, 100); // Small delay to let Zustand persist middleware load

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return {
    isAuthenticated,
    isLoading: isChecking,
  };
}
