"use client";

import { useMutation } from "@tanstack/react-query";
import { signInWithAuth } from "../api";
import { useAppStore } from "../../../stores/app-store";
import { ApiError } from "../../../api/api-client";

export function useLogin() {
  const { initializeAuth } = useAppStore();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithAuth(email, password),

    onSuccess: async () => {
      // Reinitialize auth to fetch session + profile with onboardingCompleted
      await initializeAuth();
    },

    onError: (error: ApiError) => {
      console.error("Login failed:", error.message);
    },
  });
}
