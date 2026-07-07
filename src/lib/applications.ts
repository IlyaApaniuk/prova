import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** One application per (vacancy, candidate) — enforced by the DB unique. */
export const findApplication = cache((vacancyId: string, candidateId: string) =>
  prisma.application.findUnique({
    where: { vacancyId_candidateId: { vacancyId, candidateId } },
  }),
);
