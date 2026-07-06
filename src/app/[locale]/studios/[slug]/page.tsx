import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { VacancyCard } from "@/components/jobs/vacancy-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { type Locale } from "@/i18n/routing";
import { getStudioBySlug, studioLinks } from "@/lib/vacancies";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) return {};
  return {
    title: `${studio.name} · prova`,
    description: studio.about?.slice(0, 160),
  };
}

export default async function StudioPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const [t, studio] = await Promise.all([
    getTranslations("Jobs"),
    getStudioBySlug(slug),
  ]);
  if (!studio) notFound();

  const links = studioLinks(studio.links);
  const vacanciesWithStudio = studio.vacancies.map((vacancy) => ({
    ...vacancy,
    studio,
  }));

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-12">
        <div className="flex items-center gap-4">
          <div className="from-wood to-wood-deep text-amber grid size-14 place-items-center bg-gradient-to-br font-serif text-2xl">
            {studio.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">
              {studio.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {studio.city} · {studio.country}
            </p>
          </div>
        </div>

        {studio.about ? (
          <section className="mt-8 max-w-[62ch]">
            <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
              {t("aboutStudio")}
            </h2>
            <p className="mt-3 leading-relaxed">{studio.about}</p>
            {links.website ? (
              <a
                href={links.website}
                rel="noopener noreferrer"
                target="_blank"
                className="text-cognac-deep mt-3 inline-block font-mono text-[0.7rem] tracking-[0.12em] uppercase underline underline-offset-4"
              >
                {t("website")} ↗
              </a>
            ) : null}
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
            {t("studioRoles")}
          </h2>
          {vacanciesWithStudio.length === 0 ? (
            <p className="border-hairline text-muted-foreground mt-4 border p-6">
              {t("listEmpty")}
            </p>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {vacanciesWithStudio.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
