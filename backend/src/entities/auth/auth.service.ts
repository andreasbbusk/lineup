import { supabase } from "../../config/supabase.config.js";

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
