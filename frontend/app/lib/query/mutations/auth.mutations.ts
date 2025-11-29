"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  completeProfile,
  signInWithAuth,
  signup,
} from "../../api/endpoints/auth";
import { useAppStore } from "../../stores/app-store";
import { CompleteProfileRequest, SignupRequest } from "../../types/api-types";

export function useSignupMutation() {
  const set_auth = useAppStore((state) => state.set_auth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (response) => {
      set_auth(response.user, response.session.access_token, response.profile);
      router.push("/");
    },
  });
}

export function useSignupBasicMutation() {
  const set_auth = useAppStore((state) => state.set_auth);

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (response) => {
      // Store auth token but DON'T redirect - user continues to looking_for step
      set_auth(response.user, response.session.access_token, response.profile);
    },
  });
}

export function useCompleteProfileMutation() {
  const update_profile = useAppStore((state) => state.update_profile);
  const reset_onboarding = useAppStore((state) => state.reset_onboarding);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CompleteProfileRequest) => completeProfile(data),
    onSuccess: (profile) => {
      update_profile(profile);
      reset_onboarding(); // Clear onboarding data from localStorage
      router.push("/");
    },
  });
}

export function useLoginMutation() {
  const set_auth = useAppStore((state) => state.set_auth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithAuth(email, password),
    onSuccess: (response) => {
      set_auth(response.user, response.session.access_token, response.profile);

      if (!response.profile.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    },
  });
}
