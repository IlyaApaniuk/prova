import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { StudioSettingsForm } from "@/components/dashboard/studio-settings-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/session";
import { getStudioById, getStudioMemberForUser } from "@/lib/studios";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Dashboard",
  });
  return { title: `${t("nav_studio")} · prova`, robots: { index: false } };
}

export default async function StudioSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const user = await requireUser(`/${locale}/dashboard/studio`);
  const member = await getStudioMemberForUser(user);
  if (!member) redirect(`/${locale}/dashboard`);

  const [t, studio] = await Promise.all([
    getTranslations("Dashboard"),
    getStudioById(member.studioId),
  ]);
  if (!studio) redirect(`/${locale}/dashboard`);

  const links = (studio.links ?? {}) as {
    website?: string;
    instagram?: string;
  };

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-6 py-12">
        <p className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {studio.name} · {member.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-balance">
          {t("nav_studio")}
        </h1>
        <DashboardNav active="studio" />

        <p className="text-muted-foreground mt-6 max-w-[56ch] text-sm">
          {t("studioIntro")}{" "}
          <Link
            href={`/studios/${studio.slug}`}
            className="hover:text-cognac-deep underline underline-offset-4 transition-colors"
          >
            {t("studioPublicLink")}
          </Link>
        </p>

        <div className="mt-6">
          <StudioSettingsForm
            defaults={{
              name: studio.name,
              city: studio.city,
              country: studio.country,
              about: studio.about ?? "",
              website: links.website ?? "",
              instagram: links.instagram ?? "",
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
