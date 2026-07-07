import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Current Supabase user for this request, or null. Cached per request so
 * layout, header and page can all call it without extra auth round-trips.
 * Returns null when Supabase isn't configured (CI builds, previews).
 */
export const getUser = cache(async () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
