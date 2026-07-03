"use server";

import { getPostHogServer } from "@/lib/posthog/server";
import { prisma } from "@/lib/prisma";
import { type WaitlistInput, waitlistSchema } from "@/lib/validation/waitlist";

export type WaitlistResult =
  { ok: true } | { ok: false; error: "invalid" | "server" };

export async function joinWaitlist(
  input: WaitlistInput,
): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { email, role } = parsed.data;

  try {
    // Persist once a database is connected; no-op locally without DATABASE_URL.
    if (process.env.DATABASE_URL) {
      await prisma.waitlistSignup.upsert({
        where: { email },
        update: { role },
        create: { email, role },
      });
    }

    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId: email,
        event: "waitlist_submitted",
        properties: { role },
      });
      await posthog.flush();
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "server" };
  }
}
