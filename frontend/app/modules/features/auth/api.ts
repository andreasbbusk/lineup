import { supabase } from "../../supabase/client";
import { ApiError, apiClient, handleApiError } from "../../api/api-client";

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

export interface InitializedUser {
  id: string;
  email: string;
  username: string;
  onboardingCompleted: boolean;
}

// --- Supabase Client-Side Auth ---

/**
 * Initialize auth state by checking Supabase session and fetching profile
 * Returns user data or null if not authenticated
 */
export async function initializeAuthState(): Promise<InitializedUser | null> {
  try {
    // Step 1: Get Supabase session (Contains Email + Auth ID)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("No session found");
      return null;
    }

    // Step 2: Fetch profile from database (Contains Username + Onboarding Status)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, onboarding_completed")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      // User mid-signup (steps 0-2), profile row not created in DB yet
      if (profileError.code === "PGRST116") {
        return {
          id: session.user.id,
          email: session.user.email!,
          username: "",
          onboardingCompleted: false,
        };
      }
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }

    // Step 3: Combine Session Data + Database Data
    return {
      id: profile.id,
      email: session.user.email!,
      username: profile.username,
      onboardingCompleted: profile.onboarding_completed ?? false,
    };
  } catch (error) {
    console.error("Auth init error:", error);
    return null;
  }
}

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
    throw new ApiError(500, "PROFILE_FETCH_FAILED", "Username not found");
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
