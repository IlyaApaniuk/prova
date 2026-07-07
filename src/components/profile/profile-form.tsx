"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { saveProfile } from "@/app/actions/profile";
import { cn } from "@/lib/utils";
import {
  experienceBands,
  profileSchema,
  softwareOptions,
} from "@/lib/validation/profile";

const MAX_PORTFOLIO_LINKS = 5;

function splitLinks(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// The form keeps portfolio links as a textarea (one URL per line) and maps
// them to the shared schema's array on submit.
const formSchema = profileSchema
  .omit({ portfolioLinks: true })
  .extend({
    portfolioText: z.string().max(1600).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    const links = splitLinks(value.portfolioText);
    if (links.length > MAX_PORTFOLIO_LINKS) {
      ctx.addIssue({ code: "custom", path: ["portfolioText"], message: "max" });
    } else if (
      links.some((link) => !z.string().url().safeParse(link).success)
    ) {
      ctx.addIssue({ code: "custom", path: ["portfolioText"], message: "url" });
    }
  });

type FormValues = z.input<typeof formSchema>;

export type ProfileFormDefaults = Partial<Omit<FormValues, "portfolioText">> & {
  portfolioLinks?: string[];
};

const inputClass =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2";
const labelClass =
  "text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase";
const errorClass = "text-destructive font-mono text-xs";

export function ProfileForm({
  defaults,
  nextPath,
}: {
  defaults: ProfileFormDefaults;
  nextPath: string | null;
}) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: defaults.firstName ?? "",
      lastName: defaults.lastName ?? "",
      city: defaults.city ?? "",
      country: defaults.country ?? "",
      experience: defaults.experience,
      software: defaults.software ?? [],
      headline: defaults.headline ?? "",
      portfolioText: (defaults.portfolioLinks ?? []).join("\n"),
      isIncognito: defaults.isIncognito ?? false,
    },
  });

  const experience = useWatch({ control, name: "experience" });
  const software = useWatch({ control, name: "software" });
  const isIncognito = useWatch({ control, name: "isIncognito" });

  async function onSubmit(values: FormValues) {
    setServerError(false);
    setSaved(false);
    const { portfolioText, ...rest } = values;
    const result = await saveProfile({
      ...rest,
      portfolioLinks: splitLinks(portfolioText),
    });
    if (!result.ok) {
      setServerError(true);
      return;
    }
    if (nextPath) {
      router.push(nextPath);
    } else {
      setSaved(true);
    }
  }

  function toggleSoftware(tag: (typeof softwareOptions)[number]) {
    const current = software ?? [];
    setValue(
      "software",
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
      { shouldValidate: true },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="border-hairline bg-card flex flex-col gap-6 border p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-first" className={labelClass}>
            {t("firstName")}
          </label>
          <input
            id="pf-first"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            className={inputClass}
            {...register("firstName")}
          />
          {errors.firstName ? (
            <p className={errorClass}>{t("required")}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-last" className={labelClass}>
            {t("lastName")}
          </label>
          <input
            id="pf-last"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            className={inputClass}
            {...register("lastName")}
          />
          {errors.lastName ? (
            <p className={errorClass}>{t("required")}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-city" className={labelClass}>
            {t("city")}
          </label>
          <input
            id="pf-city"
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
            className={inputClass}
            {...register("city")}
          />
          {errors.city ? <p className={errorClass}>{t("required")}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-country" className={labelClass}>
            {t("country")}
          </label>
          <input
            id="pf-country"
            autoComplete="country-name"
            aria-invalid={Boolean(errors.country)}
            className={inputClass}
            {...register("country")}
          />
          {errors.country ? (
            <p className={errorClass}>{t("required")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>{t("experience")}</span>
        <div
          role="radiogroup"
          aria-label={t("experience")}
          className="border-hairline inline-flex w-fit flex-wrap border"
        >
          {experienceBands.map((band) => (
            <button
              key={band}
              type="button"
              role="radio"
              aria-checked={experience === band}
              onClick={() =>
                setValue("experience", band, { shouldValidate: true })
              }
              className={cn(
                "ease-room px-3.5 py-1.5 font-mono text-[0.7rem] tracking-[0.08em] uppercase transition-colors duration-300",
                experience === band
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`exp${band}`)}
            </button>
          ))}
        </div>
        {errors.experience ? (
          <p className={errorClass}>{t("required")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>{t("software")}</span>
        <div className="flex flex-wrap gap-1.5">
          {softwareOptions.map((tag) => {
            const active = (software ?? []).includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSoftware(tag)}
                className={cn(
                  "ease-room border px-2.5 py-1.5 font-mono text-[0.7rem] tracking-[0.06em] uppercase transition-colors duration-300",
                  active
                    ? "border-cognac bg-cognac/10 text-foreground"
                    : "border-hairline text-muted-foreground hover:text-foreground",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        {errors.software ? (
          <p className={errorClass}>{t("softwareMin")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="pf-headline" className={labelClass}>
          {t("headline")} <span className="normal-case">· {t("optional")}</span>
        </label>
        <input
          id="pf-headline"
          placeholder={t("headlinePlaceholder")}
          aria-invalid={Boolean(errors.headline)}
          className={inputClass}
          {...register("headline")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="pf-portfolio" className={labelClass}>
          {t("portfolio")}{" "}
          <span className="normal-case">· {t("optional")}</span>
        </label>
        <textarea
          id="pf-portfolio"
          rows={3}
          placeholder={t("portfolioPlaceholder")}
          aria-invalid={Boolean(errors.portfolioText)}
          className={inputClass}
          {...register("portfolioText")}
        />
        <p className="text-taupe text-xs">{t("portfolioHint")}</p>
        {errors.portfolioText ? (
          <p className={errorClass}>
            {errors.portfolioText.message === "max"
              ? t("portfolioMax")
              : t("portfolioUrl")}
          </p>
        ) : null}
      </div>

      <label className="border-hairline flex cursor-pointer items-start gap-3 border p-4">
        <input
          type="checkbox"
          className="accent-cognac mt-0.5 size-4"
          {...register("isIncognito")}
        />
        <span>
          <span className="block text-sm font-semibold">{t("incognito")}</span>
          <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
            {isIncognito ? t("incognitoOnHint") : t("incognitoHint")}
          </span>
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {isSubmitting
            ? t("saving")
            : nextPath
              ? t("saveAndContinue")
              : t("save")}
        </button>
        {saved ? (
          <span className="text-cognac-deep inline-flex items-center gap-1.5 font-mono text-xs">
            <Check className="size-3.5" aria-hidden />
            {t("savedNote")}
          </span>
        ) : null}
      </div>
      {serverError ? <p className={errorClass}>{t("serverError")}</p> : null}
    </form>
  );
}
