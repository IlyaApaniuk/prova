import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VacancyForm } from "@/components/dashboard/vacancy-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
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
  return { title: `${t("vNewCta")} · prova`, robots: { index: false } };
}

export default async function NewVacancyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const user = await requireUser(`/${locale}/dashboard/vacancies/new`);
  const member = await getStudioMemberForUser(user);
  if (!member) redirect(`/${locale}/dashboard`);

  const t = await getTranslations("Dashboard");

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
          {t("vNewTitle")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-[56ch] text-sm">
          {t("vNewSub")}
        </p>
        <div className="mt-8">
          <VacancyForm vacancyId={null} defaults={{}} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
