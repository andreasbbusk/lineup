// Authentication Service using Supabase Auth

import { createClient } from "@supabase/supabase-js";
import { Request as ExpressRequest } from "express";
import {
  AuthResponse,
  ProfileUpdateRequest,
  SignupRequest,
  UserProfile,
} from "../types/api.types.js";
import { Profile } from "../types/database.types.js";
import {
  createHttpError,
  handleSupabaseAuthError,
} from "../utils/error-handler.js";
import {
  loginSchema,
  profileUpdateSchema,
  signupSchema,
  handleValidationError,
} from "../utils/validation.js";

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
  );
}

// Public client (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
 */
async function createUserProfile(
  userId: string,
  username: string,
  data: SignupRequest
): Promise<Profile> {
  const { data: profile, error } = await supabase
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
    throw createHttpError({
      message: "Failed to create user profile",
      statusCode: 500,
      code: "DATABASE_ERROR",
    });
  }

  return profile as Profile;
}

/**
 * Helper function to convert database profile to API profile format
 * @param profile - Database profile object
 * @param includePrivateFields - Whether to include phone/email/yearOfBirth (default: true)
 */
function mapProfileToAPI(
  profile: Profile,
  includePrivateFields: boolean = true
): UserProfile {
  const baseProfile = {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    aboutMe: profile.about_me,
    location: profile.location,
    userType: profile.user_type,
    themeColor: profile.theme_color,
    spotifyPlaylistUrl: profile.spotify_playlist_url,
    onboardingCompleted: profile.onboarding_completed,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };

  // Include private fields only for own profile
  if (includePrivateFields) {
    return {
      ...baseProfile,
      phoneCountryCode: profile.phone_country_code,
      phoneNumber: profile.phone_number,
      yearOfBirth: profile.year_of_birth,
    };
  }

  // Public profile (no phone, no yearOfBirth)
  return baseProfile;
}

/**
 * Sign up a new user with Supabase Auth and create profile
 */
export async function signUp(data: SignupRequest): Promise<AuthResponse> {
  // Validate input with Zod schema
  const validatedData = handleValidationError(signupSchema.safeParse(data));

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

  // Create user profile
  const profile = await createUserProfile(
    authData.user.id,
    validatedData.username,
    validatedData
  );

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
      profile: mapProfileToAPI(profile as Profile),
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
    profile: mapProfileToAPI(profile as Profile),
  };
}

/**
 * Sign in a user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  // Validate input with Zod schema
  const validatedData = handleValidationError(
    loginSchema.safeParse({ email, password })
  );

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
    profile: mapProfileToAPI(profile as Profile),
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
  return mapProfileToAPI(profile as Profile, isOwnProfile);
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
  // Validate input with Zod schema
  const validatedData = handleValidationError(
    profileUpdateSchema.safeParse(data)
  );

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
  const updateData: Partial<Profile> = {};
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

  return mapProfileToAPI(updatedProfile as Profile);
}

async function createAuthedSupabaseClient(token: string) {
  const client = createClient(supabaseUrl!, supabaseAnonKey!, {
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
