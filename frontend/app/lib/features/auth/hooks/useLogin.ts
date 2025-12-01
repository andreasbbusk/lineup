"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signInWithAuth } from "../api";
import { useAppStore } from "../../../stores/app-store";
import { UserProfile } from "../../profiles";

export function useLogin() {
  const set_auth = useAppStore((state) => state.set_auth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithAuth(email, password),
    onSuccess: (response) => {
      set_auth(response.user, response.session.accessToken, response.profile as UserProfile);

      // Smart redirect based on onboarding status
      if (!response.profile.onboardingCompleted) {
        router.push("/onboarding?step=3");
      } else {
        router.push("/");
      }
    },
  });
}
