"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, signup } from "../../api/endpoints/auth";
import { useAppStore } from "../../stores/app-store";
import { SignupRequest, UserProfile } from "../../types/api-types";
import { supabase } from "../../supabase/client";

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
    mutationFn: async ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;
      if (!data.user || !data.session) throw new Error("Signup failed");

      return { user: data.user, session: data.session };
    },
    onSuccess: ({ user, session }) => {
      // Store auth token but DON'T redirect - user continues onboarding
      // Use the username from user metadata
      const username =
        user.user_metadata?.username || user.email!.split("@")[0];

      const minimalProfile = {
        id: user.id,
        email: user.email!,
        username: username,
        onboardingCompleted: false,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
        // Add other required fields with defaults
        firstName: "",
        lastName: "",
        location: "",
        userType: "",
      };

      setAuth(
        { id: user.id, email: user.email! },
        session.access_token,
        minimalProfile as unknown as UserProfile
      );
    },
  });
}

export function useLoginMutation() {
  const setAuth = useAppStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
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
