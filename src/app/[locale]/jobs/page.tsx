import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VacancyCard } from "@/components/jobs/vacancy-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { type Locale } from "@/i18n/routing";
import { getPublishedVacancies } from "@/lib/vacancies";

// Rendered per request: vacancy data lives in the DB and CI builds have none.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Jobs",
  });
  return { title: `${t("listTitle")} · prova` };
}

export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [t, vacancies] = await Promise.all([
    getTranslations("Jobs"),
    getPublishedVacancies(),
  ]);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-12">
        <p className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {t("listEyebrow")}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          {t("listTitle")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-[56ch]">
          {t("listSub")}
        </p>

        {vacancies.length === 0 ? (
          <p className="border-hairline text-muted-foreground mt-10 border p-6">
            {t("listEmpty")}
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {vacancies.map((vacancy) => (
              <VacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
