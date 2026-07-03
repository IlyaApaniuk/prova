"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const active = useLocale();

  return (
    <div className="flex items-center gap-1 font-mono text-[0.7rem] tracking-[0.08em] uppercase">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          className={cn(
            "ease-room hover:text-foreground px-1.5 py-1 transition-colors duration-300",
            locale === active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
