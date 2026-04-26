import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the SERVICE_ROLE key.
 * Only call from server (route handlers / RSC) — never ship the key to the browser.
 */
export function getServerSupabase(): SupabaseClient {
  if (_serverClient) return _serverClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env (set in .env.local)"
    );
  }
  _serverClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _serverClient;
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
}
