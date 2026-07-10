import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-only privileged operations (signed upload
 * URLs, bucket management). Never import from client components — the secret
 * key bypasses RLS.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin credentials are not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
