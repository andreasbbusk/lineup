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
  const setAuth = useAppStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (response) => {
      setAuth(response.user, response.session.accessToken, response.profile);
      router.push("/");
    },
  });
}

export function useSignupBasicMutation() {
  const setAuth = useAppStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (response) => {
      // Store auth token but DON'T redirect - user continues to looking_for step
      setAuth(response.user, response.session.accessToken, response.profile);
    },
  });
}

export function useCompleteProfileMutation() {
  const updateProfileStore = useAppStore((state) => state.updateProfile);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CompleteProfileRequest) => completeProfile(data),
    onSuccess: (profile) => {
      updateProfileStore(profile);
      resetOnboarding(); // Clear onboarding data from localStorage
      router.push("/");
    },
  });
}

export function useLoginMutation() {
  const setAuth = useAppStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithAuth(email, password),
    onSuccess: (response) => {
      setAuth(response.user, response.session.accessToken, response.profile);

      if (!response.profile.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    },
  });
}
