import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "applications", href: "/dashboard" },
  { key: "vacancies", href: "/dashboard/vacancies" },
  { key: "studio", href: "/dashboard/studio" },
] as const;

export type DashboardTab = (typeof TABS)[number]["key"];

export async function DashboardNav({ active }: { active: DashboardTab }) {
  const t = await getTranslations("Dashboard");

  return (
    <div className="border-hairline mt-8 flex gap-5 border-b">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "ease-room focus-visible:outline-cognac -mb-px border-b-2 px-1 pb-2.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
            tab.key === active
              ? "border-cognac text-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent",
          )}
        >
          {t(`nav_${tab.key}`)}
        </Link>
      ))}
    </div>
  );
}
