import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/server";

// Magic-link emails link here with a token_hash (see the customized
// Supabase "Magic Link" template). verifyOtp needs no browser state, so the
// link works even when opened in a different browser than the one that
// requested it.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(searchParams.get("next"), origin);

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/sign-in?error=link", origin));
}
