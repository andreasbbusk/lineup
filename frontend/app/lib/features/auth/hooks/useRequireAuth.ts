"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../../../stores/app-store";

export function useRequireAuth() {
  const router = useRouter();
  const is_authenticated = useAppStore((state) => state.is_authenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Allow the store to hydrate from localStorage first
    const timer = setTimeout(() => {
      if (!is_authenticated) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    }, 100); // Small delay to let Zustand persist middleware load

    return () => clearTimeout(timer);
  }, [is_authenticated, router]);

  return {
    
    isAuthenticated: is_authenticated,
    isLoading: isChecking,
  };
}
