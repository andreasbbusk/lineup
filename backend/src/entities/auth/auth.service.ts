import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabase,
} from "../../config/supabase.js";
import { UserProfile } from "../../types/api.types.js";
import { Database } from "../../types/supabase.js";
import { createHttpError } from "../../utils/error-handler.js";
import { ProfileRow } from "../../utils/supabase-helpers.js";
import {
  validateDto,
  validatePhoneNumberLength,
  validateYearOfBirth,
} from "../../utils/validation.js";
import { CompleteProfileDto } from "./auth.dto.js";

/**
 * Helper function to create user profile during signup
 * Uses authenticated Supabase client to bypass RLS policies
 */
async function createUserProfile(
  user_id: string,
  username: string,
  data: CompleteProfileDto,
  accessToken?: string
): Promise<ProfileRow> {
  const client = accessToken
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, detectSessionInUrl: false },
      })
    : supabase;

  const { data: profile, error } = await client
    .from("profiles")
    .upsert(
      {
        id: user_id,
        username,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_country_code: data.phone_country_code,
        phone_number: data.phone_number,
        year_of_birth: data.year_of_birth,
        location: data.location,
        user_type: data.user_type,
        onboarding_completed: false,
      },
      { onConflict: "id" }
    )
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

// --- Core Auth Functions ---

/**
 * Complete user profile after Supabase Auth account was created
 * @param data Profile completion data
 * @param token Bearer token for authentication
 * @returns The created user profile
 */
export async function completeProfile(
  data: CompleteProfileDto,
  token: string
): Promise<UserProfile> {
  const validatedData = await validateDto(CompleteProfileDto, data);

  if (!validatePhoneNumberLength(validatedData.phone_number)) {
    throw createHttpError({
      message: "Phone number must be between 4 and 15 digits",
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  if (!validateYearOfBirth(validatedData.year_of_birth)) {
    throw createHttpError({
      message: "You must be at least 13 years old",
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw createHttpError({
      message: "Invalid or expired authentication token",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", validatedData.username)
    .maybeSingle();

  if (existingUsername && existingUsername.id !== user.id) {
    throw createHttpError({
      message: "Username is already taken",
      statusCode: 409,
      code: "CONFLICT",
    });
  }

  const { data: existingPhone } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_country_code", validatedData.phone_country_code)
    .eq("phone_number", validatedData.phone_number)
    .maybeSingle();

  if (existingPhone && existingPhone.id !== user.id) {
    throw createHttpError({
      message: "An account with this phone number already exists",
      statusCode: 409,
      code: "CONFLICT",
    });
  }

  const profile = await createUserProfile(
    user.id,
    validatedData.username,
    validatedData,
    token
  );

  return profile as UserProfile;
}

/**
 * Check if username is available
 * @param username Username to check
 * @returns Object containing available boolean
 */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  if (!username || username.length < 3 || username.length > 30) {
    return { available: false };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  return { available: !existingProfile };
}
