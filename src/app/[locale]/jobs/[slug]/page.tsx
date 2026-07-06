import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { formatSalaryRange } from "@/lib/format";
import { buildJobPostingJsonLd } from "@/lib/seo/job-posting";
import { getVacancyBySlug } from "@/lib/vacancies";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getVacancyBySlug(slug);
  if (!vacancy) return {};
  return {
    title: `${vacancy.title} — ${vacancy.studio.name} · prova`,
    description: vacancy.descriptionMd.slice(0, 160),
  };
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-hairline text-muted-foreground border px-2 py-1 font-mono text-[0.66rem] tracking-[0.06em] uppercase">
      {children}
    </span>
  );
}

export default async function VacancyPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const [t, vacancy] = await Promise.all([
    getTranslations("Jobs"),
    getVacancyBySlug(slug),
  ]);
  if (!vacancy) notFound();

  const salary = formatSalaryRange(
    locale,
    vacancy.salaryMin,
    vacancy.salaryMax,
    vacancy.currency,
  );
  const jsonLd = buildJobPostingJsonLd(vacancy);
  const employmentKey =
    vacancy.employmentType === "part-time"
      ? "employmentPartTime"
      : vacancy.employmentType === "contract"
        ? "employmentContract"
        : "employmentFullTime";

  const steps = [
    { title: t("step1"), time: t("estTime", { min: vacancy.expectedTimeMin }) },
    { title: t("step2"), time: null },
    { title: t("step3"), time: null },
    { title: t("step4"), time: null },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-6 py-10">
        <Link
          href="/jobs"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-cognac inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-3" aria-hidden />
          {t("backToList")}
        </Link>

        {/* studio row */}
        <div className="mt-8 flex items-center gap-3">
          <div className="from-wood to-wood-deep text-amber grid size-9 place-items-center bg-gradient-to-br font-serif">
            {vacancy.studio.name.charAt(0)}
          </div>
          <div className="leading-tight">
            <Link
              href={`/studios/${vacancy.studio.slug}`}
              className="hover:text-cognac-deep focus-visible:outline-cognac text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {vacancy.studio.name}
            </Link>
            <div className="text-muted-foreground text-xs">
              {vacancy.city ?? vacancy.studio.city} · {vacancy.studio.country}
            </div>
          </div>
        </div>

        <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          {vacancy.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip>{t(`format${vacancy.format}`)}</Chip>
          <Chip>{t(employmentKey)}</Chip>
          <Chip>{vacancy.seniority}</Chip>
        </div>

        {salary ? (
          <div className="border-border bg-secondary mt-6 flex items-baseline gap-2 border px-4 py-3">
            <span className="font-serif text-2xl tabular-nums">{salary}</span>
            <span className="text-muted-foreground font-mono text-[0.66rem] tracking-[0.1em] uppercase">
              {t("perMonth")}
            </span>
          </div>
        ) : null}

        {/* path preview */}
        <section className="mt-10">
          <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
            {t("pathTitle")}
          </h2>
          <div className="mt-3 flex flex-col">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="border-border grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t py-2.5 text-sm first:border-t-0"
              >
                <span
                  className={
                    i === 0
                      ? "border-cognac bg-cognac grid size-6 place-items-center border font-mono text-xs text-[#F4E9DF] tabular-nums"
                      : "border-hairline text-muted-foreground grid size-6 place-items-center border font-mono text-xs tabular-nums"
                  }
                >
                  {i + 1}
                </span>
                <span className="font-medium">{step.title}</span>
                {step.time ? (
                  <span className="text-taupe font-mono text-xs">
                    {step.time}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* about */}
        <section className="mt-10">
          <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
            {t("aboutRole")}
          </h2>
          <div className="mt-3 flex flex-col gap-4">
            {vacancy.descriptionMd.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-foreground/90 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* test task */}
        <section className="border-graphite bg-card mt-10 border p-6">
          <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
            {t("testTask")} · {t("estTime", { min: vacancy.expectedTimeMin })}
          </h2>
          {vacancy.briefPublic ? (
            <div className="mt-3 flex flex-col gap-4">
              {vacancy.briefMd.split(/\n\n+/).map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-3">{t("briefHidden")}</p>
          )}
          <p className="border-cognac text-muted-foreground mt-5 border-l-2 pl-3.5 text-sm leading-relaxed">
            {t("policyBadge")}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/#waitlist"
              className="bg-primary text-primary-foreground focus-visible:outline-cognac inline-block w-fit px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("applyCta")} →
            </Link>
            <p className="text-taupe text-xs">{t("applySoon")}</p>
          </div>
        </section>

        {/* meta chips */}
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
              {t("software")}
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vacancy.software.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
              {t("languages")}
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vacancy.languages.map((l) => (
                <Chip key={l}>{l}</Chip>
              ))}
            </div>
          </div>
        </section>

        {vacancy.validThrough ? (
          <p className="text-taupe mt-10 font-mono text-xs">
            {t("validThrough", {
              date: new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(vacancy.validThrough),
            })}
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
