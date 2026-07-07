import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/actions/auth";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Link } from "@/i18n/navigation";
import { getUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const [t, tAuth, user] = await Promise.all([
    getTranslations("Jobs"),
    getTranslations("Auth"),
    getUser(),
  ]);

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
        <nav className="flex items-center gap-4">
          <Link href="/jobs" className={navLinkClass}>
            {t("listTitle")}
          </Link>
          {user ? (
            <form action={signOut} className="flex items-center gap-3">
              <span
                className="text-muted-foreground hidden max-w-[18ch] truncate font-mono text-[0.7rem] sm:inline"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <button type="submit" className={navLinkClass}>
                {tAuth("signOutCta")}
              </button>
            </form>
          ) : (
            <Link href="/auth/sign-in" className={navLinkClass}>
              {tAuth("signInCta")}
            </Link>
          )}
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
