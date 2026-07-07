import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
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

/**
 * Like getUser, but sends signed-out visitors to the sign-in page and
 * brings them back to `nextPath` after they authenticate.
 */
export async function requireUser(nextPath: string) {
  const user = await getUser();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
