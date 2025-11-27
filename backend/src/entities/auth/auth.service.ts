// Authentication Service using Supabase Auth

import { createClient } from "@supabase/supabase-js";
import { Request as ExpressRequest } from "express";
import {
  AuthResponse,
  ProfileUpdateRequest,
  UserProfile,
} from "../../types/api.types.js";
import { ProfileRow, ProfileUpdate } from "../../utils/supabase-helpers.js";
import { Database } from "../../types/supabase.js";
import { mapProfileToAPI } from "../../utils/mappers/index.js";
import {
  createHttpError,
  handleSupabaseAuthError,
} from "../../utils/error-handler.js";
import {
  validateDto,
  validatePhoneNumberLength,
  validateYearOfBirth,
} from "../../utils/validation.js";
import { SignupDto, LoginDto } from "./auth.dto.js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabase,
} from "../../config/supabase.js";

/**
 * Extract and validate user ID from request Bearer token
 * @throws UnauthorizedError if token is missing or invalid
 */
export async function extractUserId(request: ExpressRequest): Promise<string> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createHttpError({
      message: "No authorization token provided",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw createHttpError({
      message: "Invalid or expired token",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  return user.id;
}

/**
 * Extract Bearer token from Authorization header
 * @throws UnauthorizedError if header is missing or malformed
 */
export function extractBearerToken(request: ExpressRequest): string {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createHttpError({
      message: "No authorization token provided",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  return authHeader.split(" ")[1];
}

/**
 * Helper function to create user profile during signup
 * Uses authenticated Supabase client to bypass RLS policies
 */
async function createUserProfile(
  userId: string,
  username: string,
  data: SignupDto,
  accessToken?: string
): Promise<ProfileRow> {
  // Use authenticated client if token is provided (for RLS)
  const client = accessToken
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    : supabase;

  const { data: profile, error } = await client
    .from("profiles")
    .insert({
      id: userId,
      username,
      first_name: data.firstName,
      last_name: data.lastName,
      phone_country_code: data.phoneCountryCode,
      phone_number: data.phoneNumber,
      year_of_birth: data.yearOfBirth,
      location: data.location,
      user_type: data.userType,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (error || !profile) {
    console.error("Failed to create user profile:", error);
    throw createHttpError({
      message: error?.message || "Failed to create user profile",
      statusCode: 500,
      code: "DATABASE_ERROR",
      details: error,
    });
  }

  return profile as ProfileRow;
}

/**
 * Sign up a new user with Supabase Auth and create profile
 */
export async function signUp(data: SignupDto): Promise<AuthResponse> {
  // Validate input with class-validator
  const validatedData = await validateDto(SignupDto, data);

  // Additional custom validations
  if (!validatePhoneNumberLength(validatedData.phoneNumber)) {
    throw createHttpError({
      message: "Phone number must be between 4 and 15 digits",
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  if (!validateYearOfBirth(validatedData.yearOfBirth)) {
    throw createHttpError({
      message: "You must be at least 13 years old",
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  // Check if username is already taken
  const { data: existingProfile, error: usernameCheckError } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", validatedData.username)
    .single();

  if (existingProfile) {
    throw createHttpError({
      message: "Username is already taken",
      statusCode: 409,
      code: "CONFLICT",
    });
  }

  // Check if phone number combination is already taken
  const { data: existingPhone, error: phoneCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_country_code", validatedData.phoneCountryCode)
    .eq("phone_number", validatedData.phoneNumber)
    .single();

  if (existingPhone) {
    throw createHttpError({
      message: "An account with this phone number already exists",
      statusCode: 409,
      code: "CONFLICT",
    });
  }

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
  });

  if (authError) {
    handleSupabaseAuthError(authError);
  }

  if (!authData.user) {
    throw createHttpError({
      message: "Failed to create user",
      statusCode: 500,
      code: "DATABASE_ERROR",
    });
  }

  // Create user profile using authenticated session if available
  // If profile creation fails, we need to clean up the auth user
  let profile: ProfileRow;
  try {
    profile = await createUserProfile(
      authData.user.id,
      validatedData.username,
      validatedData,
      authData.session?.access_token
    );
  } catch (profileError: any) {
    // Rollback: Delete the auth user if profile creation failed
    console.error(
      "Profile creation failed, cleaning up auth user:",
      profileError
    );
    try {
      // Use admin API to delete user (requires service role key)
      // For now, we'll log the error - in production you'd want to use service role
      await supabase.auth.admin
        .deleteUser(authData.user.id)
        .catch((deleteError) => {
          console.error("Failed to cleanup auth user:", deleteError);
          // Note: In production, you should use Supabase service role key for admin operations
        });
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
    // Re-throw the original profile creation error
    throw profileError;
  }

  // Note: Supabase may not return a session if email confirmation is required
  if (!authData.session) {
    // User created but needs email confirmation

    // Return response without session (user needs to confirm email)
    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        createdAt: authData.user.created_at,
      },
      session: {
        accessToken: "",
        refreshToken: "",
        expiresIn: 0,
        expiresAt: 0,
      },
      profile: mapProfileToAPI(profile as ProfileRow),
    };
  }

  // Return auth response with session
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
    profile: mapProfileToAPI(profile as ProfileRow),
  };
}

/**
 * Sign in a user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  // Validate input with class-validator
  const validatedData = await validateDto(LoginDto, { email, password });

  // Sign in with Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

  if (authError) {
    handleSupabaseAuthError(authError);
  }

  if (!authData.user || !authData.session) {
    throw createHttpError({
      message: "Invalid email or password",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    throw createHttpError({
      message: "Failed to fetch user profile",
      statusCode: 500,
      code: "DATABASE_ERROR",
    });
  }

  // Return auth response
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
    profile: mapProfileToAPI(profile as ProfileRow),
  };
}

/**
 * Get user profile by username
 * Returns private fields if authenticatedUserId matches the profile owner
 */
export async function getUserByUsername(
  username: string,
  authenticatedUserId?: string
): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    throw createHttpError({
      message: "User not found",
      statusCode: 500,
      code: "DATABASE_ERROR",
    });
  }

  // Include private fields only if viewing own profile
  const isOwnProfile = authenticatedUserId === profile.id;
  return mapProfileToAPI(profile as ProfileRow, isOwnProfile);
}

/**
 * Update user profile (private - requires auth)
 * Only the profile owner can update their own profile
 */
export async function updateUserProfile(
  username: string,
  userId: string,
  data: ProfileUpdateRequest,
  token: string
): Promise<UserProfile> {
  // Note: This function is deprecated in favor of UsersService.updateProfile
  // Validation is handled by TSOA/class-validator in the controller
  const validatedData = data;

  // Verify the username belongs to the authenticated user
  const authedSupabase = await createAuthedSupabaseClient(token);

  const { data: profile, error: fetchError } = await authedSupabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  if (fetchError || !profile) {
    throw createHttpError({
      message: "User not found",
      statusCode: 500,
      code: "DATABASE_ERROR",
    });
  }

  if (profile.id !== userId) {
    throw createHttpError({
      message: "You can only update your own profile",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  // Prepare update data (map API format to database format)
  const updateData: ProfileUpdate = {};
  if (validatedData.firstName !== undefined) {
    updateData.first_name = validatedData.firstName;
  }
  if (validatedData.lastName !== undefined) {
    updateData.last_name = validatedData.lastName;
  }
  if (validatedData.bio !== undefined) {
    updateData.bio = validatedData.bio;
  }
  if (validatedData.aboutMe !== undefined) {
    updateData.about_me = validatedData.aboutMe;
  }
  if (validatedData.avatarUrl !== undefined) {
    updateData.avatar_url = validatedData.avatarUrl;
  }
  if (validatedData.location !== undefined) {
    updateData.location = validatedData.location;
  }
  if (validatedData.themeColor !== undefined) {
    updateData.theme_color = validatedData.themeColor;
  }
  if (validatedData.spotifyPlaylistUrl !== undefined) {
    updateData.spotify_playlist_url = validatedData.spotifyPlaylistUrl;
  }
  if (validatedData.phoneCountryCode !== undefined) {
    updateData.phone_country_code = validatedData.phoneCountryCode;
  }
  if (validatedData.phoneNumber !== undefined) {
    updateData.phone_number = validatedData.phoneNumber;
  }
  if (validatedData.onboardingCompleted !== undefined) {
    updateData.onboarding_completed = validatedData.onboardingCompleted;
  }

  // Update the profile
  const { data: updatedProfile, error: updateError } = await authedSupabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();

  if (updateError || !updatedProfile) {
    throw createHttpError({
      message: "Failed to update profile",
      statusCode: 500,
      code: "DATABASE_ERROR",
    });
  }

  return mapProfileToAPI(updatedProfile as ProfileRow);
}

async function createAuthedSupabaseClient(token: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  try {
    await client.auth.setSession({
      access_token: token,
      refresh_token: "",
    });
  } catch {
    // Best-effort session setup; Authorization header already enforces RLS context
  }

  return client;
}
