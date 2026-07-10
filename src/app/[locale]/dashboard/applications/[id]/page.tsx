import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarkReviewed } from "@/components/dashboard/mark-reviewed";
import { ReviewActions } from "@/components/dashboard/review-actions";
import { ReviewTabs } from "@/components/dashboard/review-tabs";
import { StatusChip } from "@/components/dashboard/status-chip";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { getStudioApplication } from "@/lib/applications";
import { requireUser } from "@/lib/auth/session";
import { getStudioMemberForUser } from "@/lib/studios";
import { createAdminClient } from "@/lib/supabase/admin";

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
  return { title: `${t("reviewTitle")} · prova`, robots: { index: false } };
}

async function submissionSignedUrl(path: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.storage
      .from("submissions")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-hairline text-muted-foreground border px-2 py-1 font-mono text-[0.66rem] tracking-[0.06em] uppercase">
      {children}
    </span>
  );
}

export default async function ReviewApplicationPage({
  params,
}: {
  params: PageParams;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const user = await requireUser(`/${locale}/dashboard/applications/${id}`);
  const member = await getStudioMemberForUser(user);
  if (!member) redirect(`/${locale}/dashboard`);

  const [t, tProfile, application] = await Promise.all([
    getTranslations("Dashboard"),
    getTranslations("Profile"),
    getStudioApplication(id, member.studioId),
  ]);
  if (!application) notFound();

  const candidate = application.candidate;
  const revealed = !candidate.isIncognito || application.revealedAt;
  const name = revealed
    ? `${candidate.firstName} ${candidate.lastName}`
    : t("incognitoName");
  const fileUrl = application.submissionFileUrl
    ? await submissionSignedUrl(application.submissionFileUrl)
    : null;

  const workPanel = (
    <div className="flex flex-col gap-5">
      {application.submissionComment ? (
        <p className="border-cognac text-foreground/90 border-l-2 pl-3.5 text-sm leading-relaxed">
          {application.submissionComment}
        </p>
      ) : null}
      {application.submissionLink ? (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
            {t("workLink")}
          </span>
          <a
            href={application.submissionLink}
            target="_blank"
            rel="noreferrer"
            className="hover:text-cognac-deep w-fit text-sm break-all underline underline-offset-4 transition-colors"
          >
            {application.submissionLink}
          </a>
        </div>
      ) : null}
      {fileUrl ? (
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
            {t("workFile")}
          </span>
          <object
            data={fileUrl}
            type="application/pdf"
            className="border-hairline h-[70vh] w-full border"
          >
            <p className="p-4 text-sm">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {t("workFileOpen")}
              </a>
            </p>
          </object>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground w-fit font-mono text-[0.7rem] tracking-[0.12em] uppercase underline underline-offset-4 transition-colors"
          >
            {t("workFileOpen")}
          </a>
        </div>
      ) : application.submissionFileUrl ? (
        <p className="text-destructive font-mono text-xs">
          {t("workFileError")}
        </p>
      ) : null}
    </div>
  );

  const profilePanel = (
    <div className="flex flex-col gap-5 text-sm">
      {!revealed ? (
        <p className="border-cognac/40 bg-cognac/5 text-muted-foreground border p-4 leading-relaxed">
          {t("incognitoNote")}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
            {tProfile("firstName")}
          </div>
          <div className="mt-1 font-medium">{name}</div>
        </div>
        <div>
          <div className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
            {tProfile("city")} · {tProfile("country")}
          </div>
          <div className="mt-1">
            {candidate.city}, {candidate.country}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
            {tProfile("experience")}
          </div>
          <div className="mt-1">
            {tProfile(`exp${candidate.experience}` as "expUNDER_1")}
          </div>
        </div>
        {candidate.headline ? (
          <div>
            <div className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
              {tProfile("headline")}
            </div>
            <div className="mt-1 italic">{candidate.headline}</div>
          </div>
        ) : null}
      </div>
      <div>
        <div className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
          {tProfile("software")}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {candidate.software.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </div>
      {revealed && candidate.portfolioLinks.length > 0 ? (
        <div>
          <div className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase">
            {tProfile("portfolio")}
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {candidate.portfolioLinks.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cognac-deep break-all underline underline-offset-4 transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex min-h-svh flex-col">
      {application.status === "SUBMITTED" ? (
        <MarkReviewed applicationId={application.id} />
      ) : null}
      <SiteHeader />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-6 py-10">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-cognac inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-3" aria-hidden />
          {t("backToList")}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatusChip
            status={application.status}
            label={t(
              // STARTED never reaches studio queries.
              `status${application.status}` as "statusSUBMITTED",
            )}
          />
          {application.submittedAt ? (
            <span className="text-taupe font-mono text-xs tabular-nums">
              {t("submittedOn")}{" "}
              {new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
              }).format(application.submittedAt)}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          {name}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {application.vacancy.title}
        </p>

        {application.status === "INTERESTED" && application.interestMessage ? (
          <p className="border-graphite bg-card text-foreground/90 mt-6 border p-4 text-sm leading-relaxed">
            &ldquo;{application.interestMessage}&rdquo;
          </p>
        ) : null}
        {application.status === "DECLINED" && application.declineReason ? (
          <p className="border-hairline bg-card text-muted-foreground mt-6 border p-4 text-sm leading-relaxed">
            {t("declinedWith")} {application.declineReason}
          </p>
        ) : null}

        <div className="mt-8">
          <ReviewTabs
            workLabel={t("workTab")}
            profileLabel={t("profileTab")}
            work={workPanel}
            profile={profilePanel}
          />
        </div>

        <div className="mt-10">
          <ReviewActions
            applicationId={application.id}
            status={application.status}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
