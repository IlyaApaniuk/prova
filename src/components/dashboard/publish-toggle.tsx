"use client";

import type { VacancyStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setVacancyStatus } from "@/app/actions/studio";

export function PublishToggle({
  vacancyId,
  status,
}: {
  vacancyId: string;
  status: VacancyStatus;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (status === "CLOSED") return null;

  const target = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  async function toggle() {
    setFailed(false);
    setBusy(true);
    const result = await setVacancyStatus(vacancyId, target);
    setBusy(false);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={toggle}
        className={
          target === "PUBLISHED"
            ? "bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            : "border-input text-muted-foreground hover:border-graphite hover:text-foreground ease-room border px-5 py-3 text-sm font-semibold transition-colors duration-300 disabled:opacity-60"
        }
      >
        {busy
          ? t("saving")
          : target === "PUBLISHED"
            ? t("vPublishCta")
            : t("vUnpublishCta")}
      </button>
      {failed ? (
        <p className="text-destructive font-mono text-xs">
          {t("actionFailed")}
        </p>
      ) : null}
    </div>
  );
}
