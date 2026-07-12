"use server";

import type { Prisma } from "@prisma/client";
import { getUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { getStudioMemberForUser } from "@/lib/studios";
import {
  type StudioInput,
  type VacancyInput,
  studioSchema,
  vacancySchema,
} from "@/lib/validation/studio";

async function requireMember() {
  const user = await getUser();
  if (!user) return null;
  return getStudioMemberForUser(user);
}

export type StudioActionResult = { ok: boolean };

export async function updateStudio(
  input: StudioInput,
): Promise<StudioActionResult> {
  const member = await requireMember();
  if (!member) return { ok: false };

  const parsed = studioSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const { name, city, country, about, website, instagram } = parsed.data;

  const links: Prisma.JsonObject = {};
  if (website) links.website = website;
  if (instagram) links.instagram = instagram;

  try {
    await prisma.studio.update({
      where: { id: member.studioId },
      data: { name, city, country, about: about || null, links },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

function vacancyData(data: ReturnType<typeof vacancySchema.parse>) {
  return {
    title: data.title,
    seniority: data.seniority,
    format: data.format,
    city: data.city || null,
    employmentType: data.employmentType,
    salaryMin: data.salaryMin ?? null,
    salaryMax: data.salaryMax ?? null,
    currency:
      data.salaryMin !== undefined || data.salaryMax !== undefined
        ? (data.currency ?? null)
        : null,
    software: [...data.software],
    languages: [...data.languages],
    descriptionMd: data.descriptionMd,
    briefMd: data.briefMd,
    briefPublic: data.briefPublic,
    expectedTimeMin: data.expectedTimeMin,
    // End of the given day — the vacancy stays valid through the date shown.
    validThrough: data.validThrough
      ? new Date(`${data.validThrough}T23:59:59Z`)
      : null,
  };
}

export type SaveVacancyResult = { ok: true; id: string } | { ok: false };

export async function saveVacancy(
  vacancyId: string | null,
  input: VacancyInput,
): Promise<SaveVacancyResult> {
  const member = await requireMember();
  if (!member) return { ok: false };

  const parsed = vacancySchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const data = vacancyData(parsed.data);

  try {
    if (vacancyId) {
      const updated = await prisma.vacancy.updateMany({
        where: { id: vacancyId, studioId: member.studioId },
        data,
      });
      return updated.count === 1 ? { ok: true, id: vacancyId } : { ok: false };
    }

    // Slugs are permanent (SEO): generated once, uniquified with a suffix.
    const base = `${member.studio.slug.split("-")[0]}-${slugify(data.title)}`;
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
      try {
        const created = await prisma.vacancy.create({
          data: { ...data, studioId: member.studioId, slug, status: "DRAFT" },
        });
        return { ok: true, id: created.id };
      } catch (error) {
        const isUniqueViolation =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002";
        if (!isUniqueViolation) throw error;
      }
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function setVacancyStatus(
  vacancyId: string,
  status: "PUBLISHED" | "DRAFT",
): Promise<StudioActionResult> {
  const member = await requireMember();
  if (!member) return { ok: false };

  const updated = await prisma.vacancy.updateMany({
    where: {
      id: vacancyId,
      studioId: member.studioId,
      // Closed vacancies reopen via the close/outcome flow, not here.
      status: { in: ["DRAFT", "PUBLISHED"] },
    },
    data: { status },
  });
  return { ok: updated.count === 1 };
}
