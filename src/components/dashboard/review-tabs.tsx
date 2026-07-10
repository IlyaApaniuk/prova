"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Soft blind review by layout: the work is the first tab, the profile sits
 * behind the second. Both panels arrive server-rendered as props.
 */
export function ReviewTabs({
  workLabel,
  profileLabel,
  work,
  profile,
}: {
  workLabel: string;
  profileLabel: string;
  work: React.ReactNode;
  profile: React.ReactNode;
}) {
  const [tab, setTab] = useState<"work" | "profile">("work");

  const tabClass = (active: boolean) =>
    cn(
      "ease-room -mb-px border-b-2 px-1 pb-2.5 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors duration-300",
      active
        ? "border-cognac text-foreground"
        : "text-muted-foreground hover:text-foreground border-transparent",
    );

  return (
    <div>
      <div
        role="tablist"
        className="border-hairline flex gap-5 border-b"
        aria-label={`${workLabel} / ${profileLabel}`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "work"}
          onClick={() => setTab("work")}
          className={tabClass(tab === "work")}
        >
          {workLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          onClick={() => setTab("profile")}
          className={tabClass(tab === "profile")}
        >
          {profileLabel}
        </button>
      </div>
      <div className="mt-6">{tab === "work" ? work : profile}</div>
    </div>
  );
}
