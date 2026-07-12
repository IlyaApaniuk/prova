import { z } from "zod";
import { softwareOptions } from "@/lib/validation/profile";

export const seniorities = ["JUNIOR", "MIDDLE", "SENIOR", "LEAD"] as const;
export const workFormats = ["OFFICE", "HYBRID", "REMOTE"] as const;
export const employmentTypes = ["full-time", "part-time", "contract"] as const;
export const currencies = ["EUR", "USD", "UAH", "PLN", "GBP"] as const;
export const vacancyLanguages = ["en", "uk", "ru", "pl", "de"] as const;

// Honest-timing policy: no "40 minutes" for 3-hour work, and nothing over
// 4 hours at all — that stops being a neutral check and starts being labor.
export const EXPECTED_TIME_MIN = 15;
export const EXPECTED_TIME_MAX = 240;

const optionalInt = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  z.number().int().min(0).max(1_000_000).optional(),
);

export const studioSchema = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(1).max(80),
  about: z.string().trim().max(1000).optional().or(z.literal("")),
  website: z.string().trim().url().max(200).optional().or(z.literal("")),
  instagram: z.string().trim().max(80).optional().or(z.literal("")),
});

export type StudioInput = z.input<typeof studioSchema>;

export const vacancySchema = z
  .object({
    title: z.string().trim().min(3).max(80),
    seniority: z.enum(seniorities),
    format: z.enum(workFormats),
    city: z.string().trim().max(80).optional().or(z.literal("")),
    employmentType: z.enum(employmentTypes),
    salaryMin: optionalInt,
    salaryMax: optionalInt,
    currency: z.enum(currencies).optional(),
    software: z.array(z.enum(softwareOptions)).min(1),
    languages: z.array(z.enum(vacancyLanguages)).min(1),
    descriptionMd: z.string().trim().min(40).max(6000),
    briefMd: z.string().trim().min(40).max(6000),
    briefPublic: z.boolean().default(true),
    expectedTimeMin: z.preprocess(
      (value) => (value === "" || value === null ? undefined : Number(value)),
      z.number().int().min(EXPECTED_TIME_MIN).max(EXPECTED_TIME_MAX),
    ),
    validThrough: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (value) =>
      !(value.salaryMin !== undefined && value.salaryMax !== undefined) ||
      value.salaryMax >= value.salaryMin,
    { message: "salary_order", path: ["salaryMax"] },
  )
  .refine(
    (value) =>
      (value.salaryMin === undefined && value.salaryMax === undefined) ||
      Boolean(value.currency),
    { message: "currency_required", path: ["currency"] },
  );

export type VacancyInput = z.input<typeof vacancySchema>;
