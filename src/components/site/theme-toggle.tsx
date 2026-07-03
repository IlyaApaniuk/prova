"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** false during SSR, true after hydration — without a setState-in-effect. */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";
  const label = mounted && isDark ? t("toLight") : t("toDark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border-hairline text-foreground ease-room hover:border-graphite hover:bg-card focus-visible:outline-cognac inline-flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label={label}
    >
      {mounted && isDark ? (
        <Sun className="size-3.5" aria-hidden />
      ) : (
        <Moon className="size-3.5" aria-hidden />
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
