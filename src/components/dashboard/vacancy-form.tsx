"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { saveVacancy } from "@/app/actions/studio";
import { cn } from "@/lib/utils";
import { softwareOptions } from "@/lib/validation/profile";
import {
  EXPECTED_TIME_MAX,
  EXPECTED_TIME_MIN,
  type VacancyInput,
  currencies,
  employmentTypes,
  seniorities,
  vacancyLanguages,
  vacancySchema,
  workFormats,
} from "@/lib/validation/studio";

const inputClass =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-graphite focus-visible:outline-cognac w-full border px-3.5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2";
const labelClass =
  "text-muted-foreground font-mono text-[0.7rem] tracking-[0.12em] uppercase";
const errorClass = "text-destructive font-mono text-xs";
const chipClass = (active: boolean) =>
  cn(
    "ease-room border px-2.5 py-1.5 font-mono text-[0.7rem] tracking-[0.06em] uppercase transition-colors duration-300",
    active
      ? "border-cognac bg-cognac/10 text-foreground"
      : "border-hairline text-muted-foreground hover:text-foreground",
  );
const EMPLOYMENT_KEY = {
  "full-time": "vEmployment_full_time",
  "part-time": "vEmployment_part_time",
  contract: "vEmployment_contract",
} as const;

const segmentClass = (active: boolean) =>
  cn(
    "ease-room px-3.5 py-1.5 font-mono text-[0.7rem] tracking-[0.08em] uppercase transition-colors duration-300",
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground",
  );

export function VacancyForm({
  vacancyId,
  defaults,
}: {
  vacancyId: string | null;
  defaults: Partial<VacancyInput>;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VacancyInput>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: defaults.title ?? "",
      seniority: defaults.seniority ?? "MIDDLE",
      format: defaults.format ?? "OFFICE",
      city: defaults.city ?? "",
      employmentType: defaults.employmentType ?? "full-time",
      salaryMin: defaults.salaryMin ?? "",
      salaryMax: defaults.salaryMax ?? "",
      currency: defaults.currency,
      software: defaults.software ?? [],
      languages: defaults.languages ?? [],
      descriptionMd: defaults.descriptionMd ?? "",
      briefMd: defaults.briefMd ?? "",
      briefPublic: defaults.briefPublic ?? true,
      expectedTimeMin: defaults.expectedTimeMin ?? 90,
      validThrough: defaults.validThrough ?? "",
    },
  });

  const seniority = useWatch({ control, name: "seniority" });
  const format = useWatch({ control, name: "format" });
  const employmentType = useWatch({ control, name: "employmentType" });
  const currency = useWatch({ control, name: "currency" });
  const software = useWatch({ control, name: "software" });
  const languages = useWatch({ control, name: "languages" });
  const briefPublic = useWatch({ control, name: "briefPublic" });

  function toggleIn<T extends string>(
    field: "software" | "languages",
    current: readonly T[] | undefined,
    value: T,
  ) {
    const list = current ?? [];
    setValue(
      field,
      (list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]) as VacancyInput["software"] &
        VacancyInput["languages"],
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: VacancyInput) {
    setFailed(false);
    setSaved(false);
    const result = await saveVacancy(vacancyId, values);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    if (!vacancyId) {
      router.push(`/dashboard/vacancies/${result.id}`);
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="border-hairline bg-card flex flex-col gap-6 border p-8"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="vf-title" className={labelClass}>
          {t("vTitle")}
        </label>
        <input
          id="vf-title"
          placeholder={t("vTitlePlaceholder")}
          className={inputClass}
          {...register("title")}
        />
        {errors.title ? (
          <p className={errorClass}>{t("fieldInvalid")}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className={labelClass}>{t("vSeniority")}</span>
          <div className="border-hairline inline-flex w-fit flex-wrap border">
            {seniorities.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={seniority === option}
                onClick={() =>
                  setValue("seniority", option, { shouldValidate: true })
                }
                className={segmentClass(seniority === option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={labelClass}>{t("vFormat")}</span>
          <div className="border-hairline inline-flex w-fit flex-wrap border">
            {workFormats.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={format === option}
                onClick={() =>
                  setValue("format", option, { shouldValidate: true })
                }
                className={segmentClass(format === option)}
              >
                {t(`vFormat${option}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={labelClass}>{t("vEmployment")}</span>
          <div className="border-hairline inline-flex w-fit flex-wrap border">
            {employmentTypes.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={employmentType === option}
                onClick={() =>
                  setValue("employmentType", option, { shouldValidate: true })
                }
                className={segmentClass(employmentType === option)}
              >
                {t(EMPLOYMENT_KEY[option])}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="vf-city" className={labelClass}>
            {t("vCity")} <span className="normal-case">· {t("optional")}</span>
          </label>
          <input id="vf-city" className={inputClass} {...register("city")} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>
          {t("vSalary")} <span className="normal-case">· {t("optional")}</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder={t("vSalaryMin")}
            aria-label={t("vSalaryMin")}
            className={cn(inputClass, "w-32")}
            {...register("salaryMin")}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min={0}
            placeholder={t("vSalaryMax")}
            aria-label={t("vSalaryMax")}
            className={cn(inputClass, "w-32")}
            {...register("salaryMax")}
          />
          <div className="border-hairline inline-flex border">
            {currencies.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={currency === option}
                onClick={() =>
                  setValue("currency", option, { shouldValidate: true })
                }
                className={segmentClass(currency === option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <p className="text-taupe text-xs">{t("vSalaryHint")}</p>
        {errors.salaryMax ? (
          <p className={errorClass}>{t("vSalaryOrder")}</p>
        ) : null}
        {errors.currency ? (
          <p className={errorClass}>{t("vCurrencyRequired")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>{t("vSoftware")}</span>
        <div className="flex flex-wrap gap-1.5">
          {softwareOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={(software ?? []).includes(tag)}
              onClick={() => toggleIn("software", software, tag)}
              className={chipClass((software ?? []).includes(tag))}
            >
              {tag}
            </button>
          ))}
        </div>
        {errors.software ? <p className={errorClass}>{t("vPickOne")}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>{t("vLanguages")}</span>
        <div className="flex flex-wrap gap-1.5">
          {vacancyLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              aria-pressed={(languages ?? []).includes(lang)}
              onClick={() => toggleIn("languages", languages, lang)}
              className={chipClass((languages ?? []).includes(lang))}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        {errors.languages ? (
          <p className={errorClass}>{t("vPickOne")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="vf-description" className={labelClass}>
          {t("vDescription")}
        </label>
        <textarea
          id="vf-description"
          rows={7}
          maxLength={6000}
          placeholder={t("vDescriptionPlaceholder")}
          className={inputClass}
          {...register("descriptionMd")}
        />
        {errors.descriptionMd ? (
          <p className={errorClass}>{t("vTooShort")}</p>
        ) : null}
      </div>

      <div className="border-graphite flex flex-col gap-4 border p-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="vf-brief" className={labelClass}>
            {t("vBrief")}
          </label>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t("vBriefPolicy")}
          </p>
          <textarea
            id="vf-brief"
            rows={7}
            maxLength={6000}
            placeholder={t("vBriefPlaceholder")}
            className={inputClass}
            {...register("briefMd")}
          />
          {errors.briefMd ? (
            <p className={errorClass}>{t("vTooShort")}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="vf-time" className={labelClass}>
              {t("vExpectedTime")}
            </label>
            <input
              id="vf-time"
              type="number"
              min={EXPECTED_TIME_MIN}
              max={EXPECTED_TIME_MAX}
              className={cn(inputClass, "w-32")}
              {...register("expectedTimeMin")}
            />
            <p className="text-taupe text-xs">{t("vExpectedTimeHint")}</p>
            {errors.expectedTimeMin ? (
              <p className={errorClass}>{t("vTimeRange")}</p>
            ) : null}
          </div>
          <label className="flex cursor-pointer items-start gap-3 pt-1">
            <input
              type="checkbox"
              checked={briefPublic ?? true}
              onChange={(event) =>
                setValue("briefPublic", event.target.checked)
              }
              className="accent-cognac mt-0.5 size-4"
            />
            <span>
              <span className="block text-sm font-semibold">
                {t("vBriefPublic")}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                {t("vBriefPublicHint")}
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="vf-valid" className={labelClass}>
          {t("vValidThrough")}{" "}
          <span className="normal-case">· {t("optional")}</span>
        </label>
        <input
          id="vf-valid"
          type="date"
          className={cn(inputClass, "w-fit")}
          {...register("validThrough")}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground ease-room focus-visible:outline-cognac w-fit px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {isSubmitting
            ? t("saving")
            : vacancyId
              ? t("saveCta")
              : t("vCreateCta")}
        </button>
        {saved ? (
          <span className="text-cognac-deep font-mono text-xs">
            {t("savedNote")}
          </span>
        ) : null}
        {failed ? <p className={errorClass}>{t("actionFailed")}</p> : null}
      </div>
    </form>
  );
}
