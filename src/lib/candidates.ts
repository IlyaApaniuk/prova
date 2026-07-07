import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Candidate profile for a Supabase auth user id, or null before onboarding. */
export const getProfileByUserId = cache((userId: string) =>
  prisma.candidateProfile.findUnique({ where: { userId } }),
);
