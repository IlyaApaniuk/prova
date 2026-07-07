import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { startApplication } from "@/app/actions/apply";
import { ApplicationSteps } from "@/components/apply/application-steps";
import { SubmissionForm } from "@/components/apply/submission-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { findApplication } from "@/lib/applications";
import { requireUser } from "@/lib/auth/session";
import { getProfileByUserId } from "@/lib/candidates";
import { getVacancyBySlug } from "@/lib/vacancies";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [t, vacancy] = await Promise.all([
    getTranslations({ locale: locale as Locale, namespace: "Apply" }),
    getVacancyBySlug(slug),
  ]);
  if (!vacancy) return {};
  return {
    title: `${t("title")} — ${vacancy.title} · prova`,
    robots: { index: false },
  };
}

export default async function ApplyPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const applyPath = `/${locale}/jobs/${slug}/apply`;

  const user = await requireUser(applyPath);
  const profile = await getProfileByUserId(user.id);
  if (!profile) {
    redirect(`/${locale}/profile?next=${encodeURIComponent(applyPath)}`);
  }

  const vacancy = await getVacancyBySlug(slug);
  if (!vacancy || vacancy.status !== "PUBLISHED") notFound();

  const [t, tJobs, application] = await Promise.all([
    getTranslations("Apply"),
    getTranslations("Jobs"),
    findApplication(vacancy.id, profile.id),
  ]);

  const showBrief = !application || application.status === "STARTED";

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[680px] flex-1 px-6 py-10">
        <Link
          href={`/jobs/${slug}`}
          className="text-muted-foreground hover:text-foreground focus-visible:outline-cognac inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-3" aria-hidden />
          {t("backToVacancy")}
        </Link>

        <p className="text-cognac-deep mt-8 font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {t("eyebrow")} · {vacancy.studio.name}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          {vacancy.title}
        </h1>

        {showBrief ? (
          <>
            {/* the brief — always in full here, behind the auth+profile gate */}
            <section className="border-graphite bg-card mt-8 border p-6">
              <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                {tJobs("testTask")} ·{" "}
                {tJobs("estTime", { min: vacancy.expectedTimeMin })}
              </h2>
              <div className="mt-3 flex flex-col gap-4">
                {vacancy.briefMd.split(/\n\n+/).map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
              <p className="border-cognac text-muted-foreground mt-5 border-l-2 pl-3.5 text-sm leading-relaxed">
                {tJobs("policyBadge")}
              </p>
            </section>

            {!application ? (
              <section className="mt-8">
                <form action={startApplication.bind(null, slug)}>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {t("startCta")}
                  </button>
                </form>
                <p className="text-taupe mt-3 max-w-[52ch] text-xs leading-relaxed">
                  {t("startNote")}
                </p>
              </section>
            ) : (
              <section className="mt-8">
                <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                  {t("submitTitle")}
                </h2>
                <div className="mt-4">
                  <SubmissionForm
                    applicationId={application.id}
                    showIncognitoChecklist={profile!.isIncognito}
                  />
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                {tJobs("pathTitle")}
              </h2>
              <div className="mt-4">
                <ApplicationSteps status={application!.status} />
              </div>
            </section>

            <section className="border-hairline bg-card mt-8 border p-6">
              <h2 className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                {t("yourWork")}
              </h2>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                {application!.submittedAt ? (
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">
                      {t("submittedOn")}
                    </dt>
                    <dd className="font-mono text-xs leading-5 tabular-nums">
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(application!.submittedAt)}
                    </dd>
                  </div>
                ) : null}
                {application!.submissionLink ? (
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">{t("workLink")}</dt>
                    <dd className="break-all">
                      <a
                        href={application!.submissionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-cognac-deep underline underline-offset-4 transition-colors"
                      >
                        {application!.submissionLink}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {application!.submissionFileUrl ? (
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">{t("workFile")}</dt>
                    <dd>{t("workFilePdf")}</dd>
                  </div>
                ) : null}
                {application!.submissionComment ? (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">
                      {t("workComment")}
                    </dt>
                    <dd className="text-foreground/90 leading-relaxed">
                      {application!.submissionComment}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
