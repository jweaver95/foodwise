import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function getSupabase(): SupabaseClient {
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Supabase environment variables are missing.");
  }
  client ??= createBrowserClient(env.url, env.key);
  return client;
}
