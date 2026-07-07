import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { SignInCard } from "@/components/auth/sign-in-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { type Locale } from "@/i18n/routing";
import { sanitizeNextPath } from "@/lib/auth/next-path";
import { getUser } from "@/lib/auth/session";

// Session state lives in cookies — rendered per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Auth",
  });
  return { title: `${t("title")} · prova`, robots: { index: false } };
}

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ locale }, { next, error }] = await Promise.all([
    params,
    searchParams,
  ]);
  setRequestLocale(locale as Locale);

  const user = await getUser();
  if (user) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("Auth");
  // Relative-path check only here; the confirm/callback routes re-sanitize
  // against the real request origin.
  const nextPath = sanitizeNextPath(next, "http://localhost");

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <p className="text-cognac-deep font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-balance">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-4 text-sm">{t("subtitle")}</p>

        {error === "link" || error === "auth" ? (
          <p className="border-destructive/40 text-destructive mt-6 border px-4 py-3 font-mono text-xs">
            {error === "link" ? t("errorLink") : t("errorAuth")}
          </p>
        ) : null}

        <div className="mt-8">
          <SignInCard nextPath={nextPath} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
