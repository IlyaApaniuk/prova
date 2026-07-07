const DEFAULT_PATH = "/";

/**
 * Post-auth redirect targets arrive via query strings and email links —
 * never trust them as-is. Only same-site targets survive: a relative path
 * ("/en/jobs/x") or an absolute URL on the given origin (magic-link emails
 * carry the full RedirectTo URL). Anything else falls back to "/".
 */
export function sanitizeNextPath(
  raw: string | null | undefined,
  origin: string,
): string {
  if (!raw) return DEFAULT_PATH;
  // "//evil.com" is protocol-relative; backslashes get normalized to "/" by browsers.
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")) {
    return raw;
  }
  try {
    const url = new URL(raw);
    if (url.origin === new URL(origin).origin) {
      return url.pathname + url.search + url.hash;
    }
  } catch {
    // Not a URL either — fall through to the default.
  }
  return DEFAULT_PATH;
}
