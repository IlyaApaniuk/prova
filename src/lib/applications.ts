import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** One application per (vacancy, candidate) — enforced by the DB unique. */
export const findApplication = cache((vacancyId: string, candidateId: string) =>
  prisma.application.findUnique({
    where: { vacancyId_candidateId: { vacancyId, candidateId } },
  }),
);

/**
 * Everything a studio may see. STARTED is filtered out at the query level —
 * unfinished attempts must never reach studio-facing code at all.
 */
export const getStudioApplications = cache((studioId: string) =>
  prisma.application.findMany({
    where: { vacancy: { studioId }, status: { not: "STARTED" } },
    include: {
      vacancy: { select: { title: true, slug: true } },
      candidate: true,
    },
    orderBy: { submittedAt: "desc" },
  }),
);

export const getStudioApplication = cache((id: string, studioId: string) =>
  prisma.application.findFirst({
    where: { id, vacancy: { studioId }, status: { not: "STARTED" } },
    include: { vacancy: true, candidate: true },
  }),
);
