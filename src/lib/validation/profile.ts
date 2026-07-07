import { z } from "zod";

export const experienceBands = [
  "UNDER_1",
  "ONE_TO_3",
  "THREE_TO_6",
  "SIX_PLUS",
] as const;

// The tag palette candidates pick from; kept in sync with what studios use
// in vacancy requirements. Free-form entries are deliberately not allowed —
// tags must stay matchable.
export const softwareOptions = [
  "Revit",
  "ArchiCAD",
  "SketchUp",
  "3ds Max",
  "Corona",
  "V-Ray",
  "Enscape",
  "Lumion",
  "D5 Render",
  "Blender",
  "AutoCAD",
  "Photoshop",
] as const;

export const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(1).max(80),
  experience: z.enum(experienceBands),
  software: z.array(z.enum(softwareOptions)).min(1).max(softwareOptions.length),
  headline: z.string().trim().max(120).optional().or(z.literal("")),
  portfolioLinks: z
    .array(z.string().trim().url().max(300))
    .max(5)
    .optional()
    .default([]),
  isIncognito: z.boolean().default(false),
});

export type ProfileInput = z.input<typeof profileSchema>;
