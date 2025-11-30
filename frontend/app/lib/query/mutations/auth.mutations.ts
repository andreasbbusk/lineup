"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signInWithAuth } from "../../api/endpoints/auth";
import { useAppStore } from "../../stores/app-store";

export function useLoginMutation() {
  const set_auth = useAppStore((state) => state.set_auth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithAuth(email, password),
    onSuccess: (response) => {
      set_auth(response.user, response.session.access_token, response.profile);

      // Smart redirect based on onboarding status
      if (!response.profile.onboarding_completed) {
        router.push("/onboarding?step=3");
      } else {
        router.push("/");
      }
    },
  });
}
