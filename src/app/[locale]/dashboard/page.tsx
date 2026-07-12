import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { StatusChip } from "@/components/dashboard/status-chip";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { getStudioApplications } from "@/lib/applications";
import { requireUser } from "@/lib/auth/session";
import { getStudioMemberForUser } from "@/lib/studios";

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
  return { title: `${t("title")} · prova`, robots: { index: false } };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const user = await requireUser(`/${locale}/dashboard`);
  const [t, member] = await Promise.all([
    getTranslations("Dashboard"),
    getStudioMemberForUser(user),
  ]);

  if (!member) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[680px] flex-1 px-6 py-16">
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            {t("notMemberTitle")}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-[52ch] text-sm leading-relaxed">
            {t("notMemberBody")}
          </p>
          <Link
            href="/jobs"
            className="bg-primary text-primary-foreground focus-visible:outline-cognac mt-8 inline-block px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("notMemberCta")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const applications = await getStudioApplications(member.studioId);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[900px] flex-1 px-6 py-12">
        <p className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {member.studio.name} · {member.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-balance">
          {t("title")}
        </h1>
        <DashboardNav active="applications" />
        <p className="text-muted-foreground mt-6 max-w-[56ch] text-sm">
          {t("subtitle")}
        </p>

        {applications.length === 0 ? (
          <p className="border-hairline text-muted-foreground mt-8 border p-6 text-sm leading-relaxed">
            {t("empty")}
          </p>
        ) : (
          <div className="mt-8 flex flex-col">
            {applications.map((application) => {
              const revealed =
                !application.candidate.isIncognito || application.revealedAt;
              const name = revealed
                ? `${application.candidate.firstName} ${application.candidate.lastName}`
                : t("incognitoName");
              return (
                <Link
                  key={application.id}
                  href={`/dashboard/applications/${application.id}`}
                  className="border-border hover:bg-card flex flex-col gap-1.5 border-t px-2 py-4 transition-colors first:border-t-0 sm:grid sm:grid-cols-[1.3fr_1fr_13.5rem] sm:items-center sm:gap-x-4"
                >
                  <span className="min-w-0 truncate font-medium">{name}</span>
                  <span className="text-muted-foreground min-w-0 truncate text-sm">
                    {application.vacancy.title}
                  </span>
                  {/* Fixed-width tail: per-row auto columns would shift the
                      middle column between rows. */}
                  <span className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-taupe w-12 font-mono text-xs tabular-nums sm:text-right">
                      {application.submittedAt
                        ? new Intl.DateTimeFormat(locale, {
                            day: "numeric",
                            month: "short",
                          }).format(application.submittedAt)
                        : "—"}
                    </span>
                    <span className="flex w-32 justify-end">
                      <StatusChip
                        status={application.status}
                        label={t(
                          // STARTED never reaches studio queries.
                          `status${application.status}` as "statusSUBMITTED",
                        )}
                      />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
