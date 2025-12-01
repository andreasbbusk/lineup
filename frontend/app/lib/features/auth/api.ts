import { supabase } from "../../supabase/client";
import {
  AuthResponse,
  AvailabilityResponse,
  SignupWithAuthRequest,
} from "./types";
import { apiClient, ApiError } from "../../api/client";

// --- Supabase Client-Side Auth ---

export async function signupWithAuth(data: SignupWithAuthRequest): Promise<{
  user: { id: string; email: string };
  session: { access_token: string } | null;
}> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { username: data.username },
    },
  });

  if (error) {
    throw new ApiError(400, "SIGNUP_FAILED", error.message);
  }

  if (!authData.user) {
    throw new ApiError(500, "USER_CREATION_FAILED", "Failed to create account");
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
    throw new ApiError(401, "LOGIN_FAILED", error.message);
  }

  if (!authData.user || !authData.session) {
    throw new ApiError(401, "LOGIN_FAILED", "Invalid email or password");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profileData) {
    throw new ApiError(
      500,
      "PROFILE_FETCH_FAILED",
      "Failed to fetch user profile"
    );
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      created_at: authData.user.created_at,
    },
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_in: authData.session.expires_in || 3600,
      expires_at: authData.session.expires_at || Date.now() / 1000 + 3600,
    },
    profile: profileData,
  };
}

// --- Backend Auth Endpoints ---

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
