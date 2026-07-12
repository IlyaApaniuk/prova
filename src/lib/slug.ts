/**
 * ASCII slug for vacancy URLs. Slugs are permanent once created (SEO), so
 * this only runs at creation time. Non-Latin titles fall back to a stub the
 * caller should suffix for uniqueness.
 */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug.length >= 3 ? slug : "role";
}
