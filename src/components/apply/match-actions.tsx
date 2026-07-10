"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmMatch, withdrawApplication } from "@/app/actions/match";

/**
 * The candidate's side of the match moment: confirm ("Continue with this
 * studio") or pass. Passing withdraws with dignity — no reason required,
 * no identity leaked.
 */
export function MatchActions({
  applicationId,
  isIncognito,
  studioName,
}: {
  applicationId: string;
  isIncognito: boolean;
  studioName: string;
}) {
  const t = useTranslations("Apply");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [passing, setPassing] = useState(false);
  const [error, setError] = useState(false);

  async function run(action: () => Promise<{ ok: boolean }>) {
    setError(false);
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="border-cognac/50 bg-cognac/5 border p-6">
      <p className="font-serif text-xl">{t("confirmTitle")}</p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {isIncognito
          ? t("confirmIncognitoNote", { studio: studioName })
          : t("confirmNote", { studio: studioName })}
      </p>
      {!passing ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => confirmMatch(applicationId))}
            className="bg-cognac ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold text-[#F4E9DF] transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
          >
            {busy ? t("confirming") : t("confirmCta", { studio: studioName })}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPassing(true)}
            className="text-muted-foreground hover:text-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors"
          >
            {t("passCta")}
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="w-full text-sm">{t("passConfirm")}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => withdrawApplication(applicationId))}
            className="border-input text-muted-foreground hover:border-graphite hover:text-foreground ease-room border px-4 py-2.5 text-sm font-semibold transition-colors duration-300 disabled:opacity-60"
          >
            {busy ? t("confirming") : t("passYes")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPassing(false)}
            className="text-muted-foreground hover:text-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors"
          >
            {t("passNo")}
          </button>
        </div>
      )}
      {error ? (
        <p className="text-destructive mt-3 font-mono text-xs">
          {t("submitFailed")}
        </p>
      ) : null}
    </div>
  );
}

/** Quiet exit for any active application state. */
export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const t = useTranslations("Apply");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function withdraw() {
    setBusy(true);
    const result = await withdrawApplication(applicationId);
    setBusy(false);
    if (result.ok) router.refresh();
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-taupe hover:text-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase underline underline-offset-4 transition-colors"
        >
          {t("withdrawCta")}
        </button>
      ) : (
        <>
          <span className="text-muted-foreground text-sm">
            {t("withdrawConfirm")}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={withdraw}
            className="text-destructive font-mono text-[0.7rem] tracking-[0.12em] uppercase underline underline-offset-4 disabled:opacity-60"
          >
            {t("passYes")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(false)}
            className="text-muted-foreground hover:text-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors"
          >
            {t("passNo")}
          </button>
        </>
      )}
    </div>
  );
}
