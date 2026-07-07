"use server";

import { getUser } from "@/lib/auth/session";
import { getPostHogServer } from "@/lib/posthog/server";
import { prisma } from "@/lib/prisma";
import { type ProfileInput, profileSchema } from "@/lib/validation/profile";

export type ProfileResult =
  { ok: true } | { ok: false; error: "unauthorized" | "invalid" | "server" };

export async function saveProfile(input: ProfileInput): Promise<ProfileResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { headline, software, portfolioLinks, ...rest } = parsed.data;
  const data = {
    ...rest,
    software: [...software],
    portfolioLinks,
    headline: headline || null,
  };

  try {
    const existing = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    if (!existing) {
      const posthog = getPostHogServer();
      if (posthog) {
        posthog.capture({ distinctId: user.id, event: "profile_completed" });
        await posthog.flush();
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "server" };
  }
}
