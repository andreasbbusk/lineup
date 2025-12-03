"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signInWithAuth } from "../api";
import { useAppStore } from "../../../stores/app-store";
import { getUserProfile } from "../../profiles/api";

export function useLogin() {
  const setAuth = useAppStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithAuth(email, password),
    onSuccess: async (response) => {
      setAuth(
        {
          id: response.user.id,
          email: response.user.email,
          username: response.user.username,
        },
        response.session.accessToken
      );

      // Fetch profile to check onboarding status
      const profile = await getUserProfile(response.user.username);

      // Pre-populate the cache with the profile
      queryClient.setQueryData(["profile", response.user.username], profile);

      // Smart redirect based on onboarding status
      if (!profile.onboardingCompleted) {
        router.push("/onboarding?step=3");
      } else {
        router.push("/");
      }
    },
  });
}
