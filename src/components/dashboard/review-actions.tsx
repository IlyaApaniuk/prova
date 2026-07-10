"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { declineApplication, markInterested } from "@/app/actions/review";
import { cn } from "@/lib/utils";
import { type DeclineInput, declineReasons } from "@/lib/validation/review";

const inputClass =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2";
const labelClass =
  "text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase";

type Mode = "idle" | "interest" | "decline";

export function ReviewActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState<DeclineInput["reason"] | null>(null);
  const [note, setNote] = useState("");

  const canInterest = status === "SUBMITTED" || status === "IN_REVIEW";
  const canDecline = canInterest || status === "INTERESTED";
  if (!canDecline) return null;

  async function sendInterest() {
    setError(null);
    setBusy(true);
    const result = await markInterested(applicationId, { message });
    setBusy(false);
    if (!result.ok) {
      setError(t("actionFailed"));
      return;
    }
    // Client state survives router.refresh() — return to the idle panel so
    // the refreshed status banner is what the lead sees.
    setMode("idle");
    router.refresh();
  }

  async function sendDecline() {
    setError(null);
    if (!reason) {
      setError(t("reasonRequired"));
      return;
    }
    if (reason === "other" && !note.trim()) {
      setError(t("noteRequired"));
      return;
    }
    setBusy(true);
    const result = await declineApplication(applicationId, { reason, note });
    setBusy(false);
    if (!result.ok) {
      setError(t("actionFailed"));
      return;
    }
    setMode("idle");
    router.refresh();
  }

  return (
    <div className="border-hairline bg-card border p-6">
      {mode === "idle" ? (
        <div className="flex flex-wrap items-center gap-3">
          {canInterest ? (
            <button
              type="button"
              onClick={() => setMode("interest")}
              className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("interestedCta")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMode("decline")}
            className="border-input text-muted-foreground hover:border-graphite hover:text-foreground ease-room focus-visible:outline-cognac border px-5 py-3 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("declineCta")}
          </button>
          {status === "INTERESTED" ? (
            <p className="text-muted-foreground text-sm">
              {t("interestedBanner")}
            </p>
          ) : null}
        </div>
      ) : mode === "interest" ? (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-xl">{t("interestTitle")}</p>
          <label htmlFor="ra-message" className={labelClass}>
            {t("interestMessageLabel")}{" "}
            <span className="normal-case">· {t("optionalMark")}</span>
          </label>
          <textarea
            id="ra-message"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("interestMessagePlaceholder")}
            className={inputClass}
          />
          <p className="text-taupe text-xs">{t("interestMessageHint")}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={sendInterest}
              disabled={busy}
              className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            >
              {busy ? t("sending") : t("interestConfirm")}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-muted-foreground hover:text-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-xl">{t("declineTitle")}</p>
          <p className="text-muted-foreground text-sm">{t("declineIntro")}</p>
          <div role="radiogroup" className="flex flex-col gap-2">
            {declineReasons.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={reason === key}
                onClick={() => setReason(key)}
                className={cn(
                  "ease-room border px-3.5 py-2.5 text-left text-sm transition-colors duration-300",
                  reason === key
                    ? "border-cognac bg-cognac/10"
                    : "border-hairline text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`reason_${key}`)}
              </button>
            ))}
          </div>
          <label htmlFor="ra-note" className={labelClass}>
            {t("declineNoteLabel")}{" "}
            <span className="normal-case">
              · {reason === "other" ? t("requiredMark") : t("optionalMark")}
            </span>
          </label>
          <textarea
            id="ra-note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("declineNotePlaceholder")}
            className={inputClass}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={sendDecline}
              disabled={busy}
              className="border-destructive/60 text-destructive hover:bg-destructive/5 ease-room focus-visible:outline-cognac border px-5 py-3 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            >
              {busy ? t("sending") : t("declineConfirm")}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-muted-foreground hover:text-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      {error ? (
        <p className="text-destructive mt-3 font-mono text-xs">{error}</p>
      ) : null}
    </div>
  );
}
