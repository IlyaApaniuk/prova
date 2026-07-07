import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ProfileForm,
  type ProfileFormDefaults,
} from "@/components/profile/profile-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { type Locale } from "@/i18n/routing";
import { sanitizeNextPath } from "@/lib/auth/next-path";
import { requireUser } from "@/lib/auth/session";
import { getProfileByUserId } from "@/lib/candidates";
import { experienceBands, softwareOptions } from "@/lib/validation/profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Profile",
  });
  return { title: `${t("title")} · prova`, robots: { index: false } };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale as Locale);

  const nextPath = next ? sanitizeNextPath(next, "http://localhost") : null;
  const selfPath = `/${locale}/profile${
    nextPath && nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""
  }`;
  const user = await requireUser(selfPath);
  const [t, profile] = await Promise.all([
    getTranslations("Profile"),
    getProfileByUserId(user.id),
  ]);

  const defaults: ProfileFormDefaults = profile
    ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city,
        country: profile.country,
        experience: experienceBands.find((band) => band === profile.experience),
        software: profile.software.filter(
          (tag): tag is (typeof softwareOptions)[number] =>
            (softwareOptions as readonly string[]).includes(tag),
        ),
        headline: profile.headline ?? "",
        portfolioLinks: profile.portfolioLinks,
        isIncognito: profile.isIncognito,
      }
    : {};

  const showOnboarding = !profile && nextPath && nextPath !== "/";

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[680px] flex-1 px-6 py-12">
        <p className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-balance">
          {profile ? t("titleEdit") : t("title")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-[56ch] text-sm">
          {showOnboarding ? t("subtitleOnboarding") : t("subtitle")}
        </p>
        <div className="mt-8">
          <ProfileForm defaults={defaults} nextPath={nextPath} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
