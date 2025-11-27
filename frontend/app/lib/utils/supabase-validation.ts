import { supabase } from "../supabase/client";

/**
 * Check if a username is available (not already taken)
 * @param username - The username to check
 * @returns Promise<{ available: boolean; error?: string }>
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; error?: string }> => {
  try {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return {
        available: false,
        error:
          "Username must be 3-30 characters and contain only letters, numbers, and underscores",
      };
    }

    // Check if username exists in profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Error checking username:", error);
      return {
        available: false,
        error: "Failed to check username availability",
      };
    }

    // If data exists, username is taken
    return {
      available: !data,
      error: data ? "Username is already taken" : undefined,
    };
  } catch (err) {
    console.error("Unexpected error checking username:", err);
    return { available: false, error: "An unexpected error occurred" };
  }
};

/**
 * Check if a phone number is available (not already taken)
 * @param phoneNumber - The phone number to check (digits only)
 * @param countryCode - The country code (e.g., "+45")
 * @returns Promise<{ available: boolean; error?: string }>
 */
export const checkPhoneAvailability = async (
  phoneNumber: string,
  countryCode: string
): Promise<{ available: boolean; error?: string }> => {
  try {
    // Validate phone number format
    const phoneRegex = /^\d{8,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        available: false,
        error: "Phone number must be at least 8 digits",
      };
    }

    // Check if phone number exists in profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_number", phoneNumber)
      .eq("phone_country_code", countryCode)
      .maybeSingle();

    if (error) {
      console.error("Error checking phone number:", error);
      return {
        available: false,
        error: "Failed to check phone availability",
      };
    }

    // If data exists, phone number is taken
    return {
      available: !data,
      error: data ? "This phone number is already registered" : undefined,
    };
  } catch (err) {
    console.error("Unexpected error checking phone number:", err);
    return { available: false, error: "An unexpected error occurred" };
  }
};
