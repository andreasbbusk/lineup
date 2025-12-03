import { supabase } from "../../supabase/client";
import { ApiError, apiClient, handleApiError } from "../../api/api-client";
import type { components } from "@/app/lib/types/api";

// Local types (Supabase-specific, not in backend)
export interface SignupWithAuthRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
  };
}

// --- Supabase Client-Side Auth ---

/**
 * Sign up with Supabase Auth
 * This uses Supabase's auth system directly and doesn't hit our backend
 */
export async function signupWithAuth(data: SignupWithAuthRequest): Promise<{
  user: { id: string; email: string; username: string };
  session: { accessToken: string } | null;
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
      username: data.username,
    },
    session: authData.session
      ? { accessToken: authData.session.access_token }
      : null,
  };
}

/**
 * Sign in with Supabase Auth
 * This uses Supabase's auth system and fetches profile from database
 */
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
    .select("username")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profileData?.username) {
    throw new ApiError(
      500,
      "PROFILE_FETCH_FAILED",
      "Username not found"
    );
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      username: profileData.username,
      createdAt: authData.user.created_at,
    },
    session: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in || 3600,
      expiresAt: authData.session.expires_at || Date.now() / 1000 + 3600,
    },
  };
}

// --- Backend Auth Endpoints ---

/**
 * Check username availability using backend API
 * Uses the generated OpenAPI types and typed client
 */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  if (!username?.trim()) {
    return { available: false };
  }

  const { data, error, response } = await apiClient.GET(
    "/auth/check-username",
    {
      params: {
        query: { username },
      },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  return data;
}
