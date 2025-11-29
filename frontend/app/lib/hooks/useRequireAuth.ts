"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../stores/app-store";

export function useRequireAuth() {
  const router = useRouter();
  const is_authenticated = useAppStore((state) => state.is_authenticated);

  useEffect(() => {
    if (!is_authenticated) {
      router.push("/login");
    }
  }, [is_authenticated, router]);

  return { isAuthenticated: is_authenticated };
}
