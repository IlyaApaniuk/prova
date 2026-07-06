import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type VacancyWithStudio = Prisma.VacancyGetPayload<{
  include: { studio: true };
}>;

export const getPublishedVacancies = cache(async () => {
  return prisma.vacancy.findMany({
    where: { status: "PUBLISHED" },
    include: { studio: true },
    orderBy: { createdAt: "desc" },
  });
});

export const getVacancyBySlug = cache(async (slug: string) => {
  return prisma.vacancy.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { studio: true },
  });
});

export const getStudioBySlug = cache(async (slug: string) => {
  const studio = await prisma.studio.findUnique({
    where: { slug },
    include: {
      vacancies: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return studio;
});

/** Loosely-typed accessor for the studio `links` Json column. */
export function studioLinks(links: Prisma.JsonValue | null | undefined): {
  website?: string;
  instagram?: string;
} {
  if (links && typeof links === "object" && !Array.isArray(links)) {
    return links as { website?: string; instagram?: string };
  }
  return {};
}
