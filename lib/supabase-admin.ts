import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the SERVICE_ROLE key.
 * Bypasses RLS — use for trusted server operations (validation, admin).
 * Never import this from a client component.
 */
export function getAdminSupabase(): SupabaseClient {
  if (_adminClient) return _adminClient;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env (set in .env.local)"
    );
  }
  _adminClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _adminClient;
}

export interface SolveRow {
  id: number;
  display_name: string;
  event: string;
  time_ms: number;
  scramble: string;
  solution: string;
  move_count: number;
  created_at: string;
  user_id?: string | null;
}
