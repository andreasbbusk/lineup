import { supabase } from "../../supabase/client";
import {
  AuthResponse,
  AvailabilityResponse,
  CompleteProfileRequest,
  LoginRequest,
  ProfileUpdateRequest,
  SignupRequest,
  SignupWithAuthRequest,
  UserProfile,
} from "../../types/api-types";
import { apiClient } from "../client";
import { mapDatabaseProfile } from "@/app/lib/utils/profile-mapper";

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/signup", data);
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const loginData: LoginRequest = { email, password };
  return apiClient.post<AuthResponse>("/auth/login", loginData);
}

export async function completeProfile(
  data: CompleteProfileRequest
): Promise<UserProfile> {
  return apiClient.post<UserProfile>("/auth/complete-profile", data);
}

export async function updateProfile(
  username: string,
  data: ProfileUpdateRequest
): Promise<UserProfile> {
  return apiClient.put<UserProfile>(`/users/${username}`, data);
}

export async function getCurrentProfile(
  username: string
): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`/users/${username}`);
}

export async function checkUsernameAvailability(
  username: string
): Promise<AvailabilityResponse> {
  if (!username?.trim()) {
    return { available: false };
  }

  const params = new URLSearchParams({ username });
  return apiClient.get<AvailabilityResponse>(
    `/auth/check-username?${params.toString()}`
  );
}

export async function signupWithAuth(data: SignupWithAuthRequest): Promise<{
  user: { id: string; email: string };
  session: { access_token: string } | null;
}> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!authData.user) {
    throw new Error("Failed to create account");
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
    },
    session: authData.session
      ? { access_token: authData.session.access_token }
      : null,
  };
}

export async function signInWithAuth(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!authData.user || !authData.session) {
    throw new Error("Invalid email or password");
  }

  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profileData) {
    throw new Error("Failed to fetch user profile");
  }

  // Map snake_case database profile to camelCase UserProfile
  const profile = mapDatabaseProfile(profileData);

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      createdAt: authData.user.created_at,
    },
    session: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in || 3600,
      expiresAt: authData.session.expires_at || Date.now() / 1000 + 3600,
    },
    profile,
  };
}
