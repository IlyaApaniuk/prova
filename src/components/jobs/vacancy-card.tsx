import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatSalaryRange } from "@/lib/format";
import type { VacancyWithStudio } from "@/lib/vacancies";

export async function VacancyCard({ vacancy }: { vacancy: VacancyWithStudio }) {
  const t = await getTranslations("Jobs");
  const locale = await getLocale();
  const salary = formatSalaryRange(
    locale,
    vacancy.salaryMin,
    vacancy.salaryMax,
    vacancy.currency,
  );

  return (
    <Link
      href={`/jobs/${vacancy.slug}`}
      className="group border-graphite bg-card hover:bg-paper focus-visible:outline-cognac flex flex-col gap-3 border p-6 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <div className="flex items-center gap-3">
        <div className="from-wood to-wood-deep text-amber grid size-8 place-items-center bg-gradient-to-br font-serif text-sm">
          {vacancy.studio.name.charAt(0)}
        </div>
        <div className="text-muted-foreground text-xs">
          {vacancy.studio.name} · {vacancy.city ?? vacancy.studio.city}
        </div>
      </div>

      <h3 className="font-serif text-2xl font-medium tracking-tight">
        {vacancy.title}
      </h3>

      <div className="flex flex-wrap gap-1.5">
        <span className="border-hairline text-muted-foreground border px-2 py-1 font-mono text-[0.64rem] tracking-[0.06em] uppercase">
          {t(`format${vacancy.format}`)}
        </span>
        {vacancy.software.slice(0, 3).map((s) => (
          <span
            key={s}
            className="border-hairline text-muted-foreground border px-2 py-1 font-mono text-[0.64rem] tracking-[0.06em] uppercase"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-baseline justify-between gap-3 pt-2">
        {salary ? (
          <span className="font-serif text-lg tabular-nums">{salary}</span>
        ) : (
          <span className="text-taupe font-mono text-xs">—</span>
        )}
        <span className="text-taupe font-mono text-xs whitespace-nowrap">
          {t("estTime", { min: vacancy.expectedTimeMin })}
        </span>
      </div>
    </Link>
  );
}
