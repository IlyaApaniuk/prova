"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { type SignInInput, signInSchema } from "@/lib/validation/auth";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3.01c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.72-4.95H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l3.99-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.44A11.98 11.98 0 0 0 1.29 6.62l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function SignInCard({ nextPath }: { nextPath: string }) {
  const t = useTranslations("Auth");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "" },
  });

  async function signInWithGoogle() {
    setFailed(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) setFailed(true);
  }

  async function onSubmit({ email }: SignInInput) {
    setFailed(false);
    const supabase = createClient();
    // The magic-link template links to /api/auth/confirm and forwards this
    // URL as the post-verification destination.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${nextPath}`,
      },
    });
    if (error) {
      setFailed(true);
    } else {
      setSentTo(email);
    }
  }

  if (sentTo) {
    return (
      <div className="border-hairline bg-card border p-8 text-center">
        <MailCheck className="text-cognac mx-auto size-6" aria-hidden />
        <h2 className="mt-4 font-serif text-2xl font-medium">
          {t("sentTitle")}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("sentBody", { email: sentTo })}
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="text-muted-foreground hover:text-foreground focus-visible:outline-cognac mt-6 font-mono text-[0.7rem] tracking-[0.12em] uppercase underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t("sentAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="border-hairline bg-card border p-8">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="border-input hover:border-graphite ease-room focus-visible:outline-cognac flex w-full items-center justify-center gap-2.5 border px-5 py-3 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <GoogleMark />
        {t("googleCta")}
      </button>

      <div
        className="text-muted-foreground my-6 flex items-center gap-3 font-mono text-[0.65rem] tracking-[0.16em] uppercase"
        aria-hidden
      >
        <span className="bg-border h-px flex-1" />
        {t("or")}
        <span className="bg-border h-px flex-1" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-2"
      >
        <label
          htmlFor="sign-in-email"
          className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase"
        >
          {t("emailLabel")}
        </label>
        <input
          id="sign-in-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={Boolean(errors.email)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-destructive font-mono text-xs">
            {t("emailInvalid")}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac mt-2 px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? t("sending") : t("sendCta")}
        </button>
      </form>

      {failed ? (
        <p className="text-destructive mt-4 font-mono text-xs">
          {t("errorAuth")}
        </p>
      ) : null}

      <p className="text-muted-foreground mt-6 text-xs">{t("noPasswords")}</p>
    </div>
  );
}
