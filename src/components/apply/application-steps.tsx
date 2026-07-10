import type { ApplicationStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

// Which of the four candidate-facing steps each status lights up.
// Terminal statuses (4) close the path — the banner explains how.
const STEP_OF: Record<ApplicationStatus, number> = {
  STARTED: 0,
  SUBMITTED: 1,
  IN_REVIEW: 1,
  INTERESTED: 2,
  MATCHED: 3,
  FINAL: 3,
  HIRED: 4,
  DECLINED: 4,
  WITHDRAWN: 4,
  EXPIRED: 4,
};

const TERMINAL: ApplicationStatus[] = [
  "HIRED",
  "DECLINED",
  "WITHDRAWN",
  "EXPIRED",
];

export async function ApplicationSteps({
  status,
}: {
  status: ApplicationStatus;
}) {
  const [t, tJobs] = await Promise.all([
    getTranslations("Apply"),
    getTranslations("Jobs"),
  ]);

  const steps = [
    tJobs("step1"),
    tJobs("step2"),
    tJobs("step3"),
    tJobs("step4"),
  ];
  const current = STEP_OF[status];
  const isTerminal = TERMINAL.includes(status);
  const isHired = status === "HIRED";

  return (
    <div>
      <div className="flex flex-col">
        {steps.map((title, i) => {
          const done = i < current || isHired;
          const now = !isTerminal && i === current;
          return (
            <div
              key={title}
              className="border-border grid grid-cols-[auto_1fr] items-center gap-3 border-t py-2.5 text-sm first:border-t-0"
            >
              <span
                className={cn(
                  "grid size-6 place-items-center border font-mono text-xs tabular-nums",
                  now
                    ? "border-cognac bg-cognac text-[#F4E9DF]"
                    : done
                      ? "border-graphite bg-graphite text-background"
                      : "border-hairline text-muted-foreground",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "font-medium",
                  !done && !now && "text-muted-foreground",
                )}
              >
                {title}
                {now ? (
                  <span className="text-cognac-deep ml-2 font-mono text-[0.66rem] tracking-[0.1em] uppercase">
                    {t("nowLabel")}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
      <p
        className={cn(
          "mt-4 border-l-2 pl-3.5 text-sm leading-relaxed",
          status === "EXPIRED" || status === "DECLINED"
            ? "border-destructive/50 text-muted-foreground"
            : "border-cognac text-muted-foreground",
        )}
      >
        {t(`status${status}`)}
      </p>
    </div>
  );
}
