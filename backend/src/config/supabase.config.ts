import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
  );
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export const SUPABASE_SERVICE_ROLE_KEY = supabaseServiceRoleKey;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export type { Database };
export type { SupabaseClient };

export function createAuthenticatedClient(
  token: string
): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
}

/**
 * Helper to get an authenticated Supabase client for RLS-protected operations.
 * 
 * This is a lightweight wrapper that creates a new client instance with the user's token.
 * Creating new client instances is cheap and necessary for RLS to work correctly.
 * 
 * @param token - User's JWT access token from Authorization header
 * @returns Authenticated Supabase client that respects RLS policies
 * 
 * @example
 * ```typescript
 * const authedSupabase = getSupabaseClient(token);
 * const { data } = await authedSupabase.from("posts").insert({ ... });
 * ```
 */
export function getSupabaseClient(token: string): SupabaseClient<Database> {
  return createAuthenticatedClient(token);
}

/**
 * Creates a Supabase client with service role key for admin operations.
 * This bypasses RLS and should only be used for backend operations that require
 * elevated permissions, such as generating signed upload URLs.
 * 
 * @returns Supabase client with service role permissions
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 */
export function createServiceRoleClient(): SupabaseClient<Database> {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for this operation but is not set in environment variables"
    );
  }
  
  return createClient<Database>(SUPABASE_URL, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
