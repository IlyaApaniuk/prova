"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateStudio } from "@/app/actions/studio";
import { type StudioInput, studioSchema } from "@/lib/validation/studio";

const inputClass =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2";
const labelClass =
  "text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase";
const errorClass = "text-destructive font-mono text-xs";

export function StudioSettingsForm({ defaults }: { defaults: StudioInput }) {
  const t = useTranslations("Dashboard");
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudioInput>({
    resolver: zodResolver(studioSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: StudioInput) {
    setSaved(false);
    setFailed(false);
    const result = await updateStudio(values);
    if (result.ok) setSaved(true);
    else setFailed(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="border-hairline bg-card flex flex-col gap-5 border p-8"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="st-name" className={labelClass}>
          {t("studioName")}
        </label>
        <input id="st-name" className={inputClass} {...register("name")} />
        {errors.name ? <p className={errorClass}>{t("fieldInvalid")}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="st-city" className={labelClass}>
            {t("studioCity")}
          </label>
          <input id="st-city" className={inputClass} {...register("city")} />
          {errors.city ? (
            <p className={errorClass}>{t("fieldInvalid")}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="st-country" className={labelClass}>
            {t("studioCountry")}
          </label>
          <input
            id="st-country"
            className={inputClass}
            {...register("country")}
          />
          {errors.country ? (
            <p className={errorClass}>{t("fieldInvalid")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="st-about" className={labelClass}>
          {t("studioAbout")}
        </label>
        <textarea
          id="st-about"
          rows={4}
          maxLength={1000}
          placeholder={t("studioAboutPlaceholder")}
          className={inputClass}
          {...register("about")}
        />
        <p className="text-taupe text-xs">{t("studioAboutHint")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="st-website" className={labelClass}>
            {t("studioWebsite")}
          </label>
          <input
            id="st-website"
            type="url"
            placeholder="https://…"
            className={inputClass}
            {...register("website")}
          />
          {errors.website ? (
            <p className={errorClass}>{t("fieldInvalid")}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="st-instagram" className={labelClass}>
            {t("studioInstagram")}
          </label>
          <input
            id="st-instagram"
            placeholder="@studio"
            className={inputClass}
            {...register("instagram")}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac w-fit px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? t("saving") : t("saveCta")}
        </button>
        {saved ? (
          <span className="text-cognac-deep inline-flex items-center gap-1.5 font-mono text-xs">
            <Check className="size-3.5" aria-hidden />
            {t("savedNote")}
          </span>
        ) : null}
        {failed ? <p className={errorClass}>{t("actionFailed")}</p> : null}
      </div>
    </form>
  );
}
