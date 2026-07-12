import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/session";
import { getStudioMemberForUser, getStudioVacancies } from "@/lib/studios";
import { cn } from "@/lib/utils";

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
  return { title: `${t("nav_vacancies")} · prova`, robots: { index: false } };
}

export default async function VacanciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const user = await requireUser(`/${locale}/dashboard/vacancies`);
  const member = await getStudioMemberForUser(user);
  if (!member) redirect(`/${locale}/dashboard`);

  const [t, vacancies] = await Promise.all([
    getTranslations("Dashboard"),
    getStudioVacancies(member.studioId),
  ]);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-6 py-12">
        <p className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {member.studio.name} · {member.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-balance">
          {t("nav_vacancies")}
        </h1>
        <DashboardNav active="vacancies" />

        <div className="mt-6">
          <Link
            href="/dashboard/vacancies/new"
            className="bg-primary text-primary-foreground focus-visible:outline-cognac inline-block px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("vNewCta")}
          </Link>
        </div>

        {vacancies.length === 0 ? (
          <p className="border-hairline text-muted-foreground mt-8 border p-6 text-sm leading-relaxed">
            {t("vEmpty")}
          </p>
        ) : (
          <div className="mt-8 flex flex-col">
            {vacancies.map((vacancy) => (
              <Link
                key={vacancy.id}
                href={`/dashboard/vacancies/${vacancy.id}`}
                className="border-border hover:bg-card flex flex-col gap-1.5 border-t px-2 py-4 transition-colors first:border-t-0 sm:grid sm:grid-cols-[1.6fr_1fr_10.5rem] sm:items-center sm:gap-x-4"
              >
                <span className="min-w-0 truncate font-medium">
                  {vacancy.title}
                </span>
                <span className="text-muted-foreground text-sm">
                  {t("vApplicationsCount", {
                    count: vacancy._count.applications,
                  })}
                </span>
                <span className="flex sm:justify-end">
                  <span
                    className={cn(
                      "border px-2 py-1 font-mono text-[0.66rem] tracking-[0.08em] uppercase",
                      vacancy.status === "PUBLISHED"
                        ? "border-cognac text-cognac-deep"
                        : "border-hairline text-muted-foreground",
                    )}
                  >
                    {t(`vStatus${vacancy.status}`)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
