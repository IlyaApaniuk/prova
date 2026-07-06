import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations("Jobs");

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
          <Link
            href="/jobs"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-cognac font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("listTitle")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
