import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("Landing");

  return (
    <footer className="border-hairline mt-auto border-t">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-baseline justify-between gap-3 px-6 py-6">
        <span className="text-muted-foreground font-serif text-sm">
          {t("footerTagline")}
        </span>
        <span className="text-taupe font-mono text-xs tabular-nums">
          {t("footerRights", { year: new Date().getFullYear() })}
        </span>
      </div>
    </footer>
  );
}
