"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { joinWaitlist } from "@/app/actions/waitlist";
import { cn } from "@/lib/utils";
import {
  type WaitlistInput,
  waitlistRoles,
  waitlistSchema,
} from "@/lib/validation/waitlist";

type FormValues = WaitlistInput;

export function WaitlistForm() {
  const t = useTranslations("Waitlist");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "", role: "candidate" },
  });

  const role = useWatch({ control, name: "role" });

  async function onSubmit(values: FormValues) {
    posthog.capture("waitlist_submit_click", { role: values.role });
    const result = await joinWaitlist(values);
    if (result.ok) {
      setDone(true);
    } else {
      setError("email", { message: t("invalidEmail") });
    }
  }

  if (done) {
    return (
      <p className="border-cognac/40 bg-cognac/10 text-foreground inline-flex items-center gap-2 border px-4 py-3 text-sm">
        <Check className="text-cognac size-4" aria-hidden />
        {t("success")}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-3"
    >
      <div
        role="radiogroup"
        aria-label={t("ariaRole")}
        className="border-hairline inline-flex w-fit border"
      >
        {waitlistRoles.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={role === option}
            onClick={() => setValue("role", option)}
            className={cn(
              "ease-room px-3.5 py-1.5 font-mono text-[0.7rem] tracking-[0.08em] uppercase transition-colors duration-300",
              role === option
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option === "candidate" ? t("roleCandidate") : t("roleCompany")}
          </button>
        ))}
      </div>

      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <input
          type="email"
          autoComplete="email"
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          aria-invalid={Boolean(errors.email)}
          className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-72"
          {...register("email")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {t("submit")}
        </button>
      </div>

      {errors.email ? (
        <p className="text-destructive font-mono text-xs">
          {t("invalidEmail")}
        </p>
      ) : null}
    </form>
  );
}
