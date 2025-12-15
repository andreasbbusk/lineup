"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppStore } from "../../../stores/Store";

/**
 * Logs out the user by signing out of Supabase and resetting local auth state.
 * Redirects to the login page on success.
 */
export function useLogout() {
  const { logout } = useAppStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
}

