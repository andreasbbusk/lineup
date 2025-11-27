"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../stores/app-store";

export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}
