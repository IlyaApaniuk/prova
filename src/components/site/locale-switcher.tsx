"use client";

import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { Link, usePathname } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Native names, not codes: a reader who doesn't know Latin script
// still finds their language.
const NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
  ru: "Русский",
  pl: "Polski",
};

export function LocaleSwitcher() {
  const pathname = usePathname();
  const active = useLocale();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className="border-border text-foreground hover:border-foreground data-[state=open]:border-foreground focus-visible:outline-cognac inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={NATIVE_NAMES[active]}
      >
        {active.toUpperCase()}
        <ChevronDown className="size-3" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        className="border-border bg-popover text-popover-foreground z-50 min-w-44 border p-1"
      >
        {routing.locales.map((locale) => (
          <DropdownMenu.Item key={locale} asChild>
            <Link
              href={pathname}
              locale={locale}
              className={cn(
                "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground flex w-full items-center justify-between gap-4 px-2.5 py-2 font-mono text-[0.7rem] tracking-[0.08em] uppercase outline-none",
                locale === active
                  ? "text-popover-foreground"
                  : "text-muted-foreground",
              )}
            >
              {NATIVE_NAMES[locale]}
              {locale === active ? (
                <span className="bg-cognac h-px w-3" aria-hidden />
              ) : null}
            </Link>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
