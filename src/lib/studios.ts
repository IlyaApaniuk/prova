import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * The studio member behind a signed-in user, or null for candidates.
 * Leads are onboarded by email; on their first sign-in we backfill the
 * Supabase user id so later email changes don't break the link.
 */
/** The lead shown to candidates as "your work is reviewed by …". */
export const getStudioReviewer = cache((studioId: string) =>
  prisma.studioMember.findFirst({
    where: { studioId },
    select: { name: true, role: true },
  }),
);

/**
 * Lead contact for the match moment — includes email, so this must only be
 * rendered to the application's own candidate once MATCHED.
 */
export const getStudioContact = cache((studioId: string) =>
  prisma.studioMember.findFirst({
    where: { studioId },
    select: { name: true, role: true, email: true },
  }),
);

export const getStudioMemberForUser = cache(async (user: User) => {
  const byId = await prisma.studioMember.findUnique({
    where: { userId: user.id },
    include: { studio: true },
  });
  if (byId) return byId;

  if (!user.email) return null;
  const byEmail = await prisma.studioMember.findUnique({
    where: { email: user.email.toLowerCase() },
    include: { studio: true },
  });
  if (!byEmail || byEmail.userId) return null;

  return prisma.studioMember.update({
    where: { id: byEmail.id },
    data: { userId: user.id },
    include: { studio: true },
  });
});
