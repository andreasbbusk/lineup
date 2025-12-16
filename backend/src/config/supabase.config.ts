import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase.js";

// Public configuration - safe to use anywhere
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
  );
}

// ✅ Safe to export - these are public values
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

// ✅ Default client for server-side operations with RLS
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type exports
export type { Database };
export type { SupabaseClient };

/**
 * Creates an authenticated Supabase client for user-specific operations.
 * 
 * This client enforces Row Level Security (RLS) policies based on the user's token.
 * Creating new client instances per request is necessary and lightweight.
 * 
 * @param token - User's JWT access token from Authorization header
 * @returns Authenticated Supabase client that respects RLS policies
 * 
 * @example
 * 
 * const authedSupabase = createAuthenticatedClient(userToken);
 * const { data } = await authedSupabase.from("posts").insert({ ... });
 * 
 */
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
 * Alias for createAuthenticatedClient for convenience.
 */
export function getSupabaseClient(token: string): SupabaseClient<Database> {
  return createAuthenticatedClient(token);
}

/**
 * Creates a Supabase client with service role privileges.
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * - This client BYPASSES all Row Level Security (RLS) policies
 * - Grants root-level access to your entire database
 * - Can read/write/delete ANY data in ANY table
 * - MUST NEVER be used in browser/client-side code
 * - MUST NEVER be exposed via API responses
 * - MUST NEVER be used for user-initiated requests
 *
 * Valid use cases ONLY:
 * - Background jobs and cron tasks (e.g., notification cleanup)
 * - Server-side analytics queries
 * - System maintenance operations
 *
 * ❌ INVALID use cases:
 * - Generating signed upload URLs (use authenticated client instead)
 * - Any operation triggered by user requests
 * - Any operation that should respect user permissions
 *
 * @returns Supabase client with service role permissions
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 * @throws Error if called in browser environment
 *
 * @example
 *
 * // ✅ CORRECT: Background cron job
 * const adminClient = createServiceRoleClient();
 * await adminClient.from('notifications').delete().eq('is_read', true);
 *
 * // ❌ WRONG: User-initiated request
 * app.post('/api/upload', (req, res) => {
 *   const adminClient = createServiceRoleClient(); // DANGEROUS!
 *   const url = await adminClient.storage.createSignedUploadUrl(...); // BYPASSES RLS!
 * });
 *
 */
export function createServiceRoleClient(): SupabaseClient<Database> {
  // Runtime check: prevent accidental browser usage
  if (typeof window !== 'undefined') {
    throw new Error(
      'CRITICAL SECURITY ERROR: Service role client cannot be created in browser environment. ' +
      'This would expose root database credentials to users.'
    );
  }

  // Keep service role key private - never export it
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations but is not set. " +
      "Set this environment variable on your server only - NEVER in client code."
    );
  }

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

