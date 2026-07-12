import { getTranslations } from "next-intl/server";
import { AccountMenu, MobileMenu } from "@/components/site/header-menu";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Link } from "@/i18n/navigation";
import { getUser } from "@/lib/auth/session";
import { getStudioMemberForUser } from "@/lib/studios";

export async function SiteHeader() {
  const [t, tAuth, tDashboard, user] = await Promise.all([
    getTranslations("Jobs"),
    getTranslations("Auth"),
    getTranslations("Dashboard"),
    getUser(),
  ]);
  const member = user ? await getStudioMemberForUser(user) : null;

  const navLinkClass =
    "text-muted-foreground hover:text-foreground focus-visible:outline-cognac font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <header className="border-hairline border-b">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="focus-visible:outline-cognac flex items-center gap-2 font-serif text-xl focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="bg-cognac inline-block h-px w-3.5" aria-hidden />
          prova
        </Link>
        <nav className="flex items-center gap-3">
          {/* Desktop: inline links + account dropdown */}
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/jobs" className={navLinkClass}>
              {t("listTitle")}
            </Link>
            {member ? (
              <Link href="/dashboard" className={navLinkClass}>
                {tDashboard("navTitle")}
              </Link>
            ) : null}
            {user?.email ? (
              <AccountMenu email={user.email} isMember={Boolean(member)} />
            ) : (
              <Link href="/auth/sign-in" className={navLinkClass}>
                {tAuth("signInCta")}
              </Link>
            )}
          </div>
          <LocaleSwitcher />
          {/* Mobile: everything behind the burger */}
          <div className="sm:hidden">
            <MobileMenu signedIn={Boolean(user)} isMember={Boolean(member)} />
          </div>
        </nav>
      </div>
    </header>
  );
}
