import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublishToggle } from "@/components/dashboard/publish-toggle";
import { VacancyForm } from "@/components/dashboard/vacancy-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getStudioMemberForUser } from "@/lib/studios";
import {
  currencies,
  employmentTypes,
  vacancyLanguages,
} from "@/lib/validation/studio";
import { softwareOptions } from "@/lib/validation/profile";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ locale: string; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Dashboard",
  });
  return { title: `${t("vEditTitle")} · prova`, robots: { index: false } };
}

export default async function EditVacancyPage({
  params,
}: {
  params: PageParams;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const user = await requireUser(`/${locale}/dashboard/vacancies/${id}`);
  const member = await getStudioMemberForUser(user);
  if (!member) redirect(`/${locale}/dashboard`);

  const [t, vacancy] = await Promise.all([
    getTranslations("Dashboard"),
    prisma.vacancy.findFirst({
      where: { id, studioId: member.studioId },
    }),
  ]);
  if (!vacancy) notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-6 py-10">
        <Link
          href="/dashboard/vacancies"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-cognac inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-3" aria-hidden />
          {t("nav_vacancies")}
        </Link>
        <h1 className="mt-8 font-serif text-4xl font-medium tracking-tight text-balance">
          {vacancy.title}
        </h1>

        <section className="border-hairline bg-card mt-6 flex flex-wrap items-center justify-between gap-4 border p-5">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.12em] uppercase">
              {t(`vStatus${vacancy.status}`)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {vacancy.status === "PUBLISHED"
                ? t("vPublishedHint")
                : t("vDraftHint")}
            </p>
            {vacancy.status === "PUBLISHED" ? (
              <Link
                href={`/jobs/${vacancy.slug}`}
                className="hover:text-cognac-deep mt-2 inline-block font-mono text-xs underline underline-offset-4 transition-colors"
              >
                {t("vViewPublic")}
              </Link>
            ) : null}
          </div>
          <PublishToggle vacancyId={vacancy.id} status={vacancy.status} />
        </section>

        <div className="mt-8">
          <VacancyForm
            vacancyId={vacancy.id}
            defaults={{
              title: vacancy.title,
              seniority: vacancy.seniority,
              format: vacancy.format,
              city: vacancy.city ?? "",
              employmentType:
                employmentTypes.find(
                  (option) => option === vacancy.employmentType,
                ) ?? "full-time",
              salaryMin: vacancy.salaryMin ?? "",
              salaryMax: vacancy.salaryMax ?? "",
              currency: currencies.find(
                (option) => option === vacancy.currency,
              ),
              software: vacancy.software.filter(
                (tag): tag is (typeof softwareOptions)[number] =>
                  (softwareOptions as readonly string[]).includes(tag),
              ),
              languages: vacancy.languages.filter(
                (lang): lang is (typeof vacancyLanguages)[number] =>
                  (vacancyLanguages as readonly string[]).includes(lang),
              ),
              descriptionMd: vacancy.descriptionMd,
              briefMd: vacancy.briefMd,
              briefPublic: vacancy.briefPublic,
              expectedTimeMin: vacancy.expectedTimeMin,
              validThrough: vacancy.validThrough
                ? vacancy.validThrough.toISOString().slice(0, 10)
                : "",
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
