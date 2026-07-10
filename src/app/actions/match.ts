"use server";

import type { ApplicationStatus } from "@prisma/client";
import { getUser } from "@/lib/auth/session";
import { getPostHogServer } from "@/lib/posthog/server";
import { prisma } from "@/lib/prisma";

async function capture(distinctId: string, event: string) {
  const posthog = getPostHogServer();
  if (posthog) {
    posthog.capture({ distinctId, event });
    await posthog.flush();
  }
}

/** Loads the application only if the caller is its candidate. */
async function ownApplication(applicationId: string) {
  const user = await getUser();
  if (!user) return null;
  const application = await prisma.application.findFirst({
    where: { id: applicationId, candidate: { userId: user.id } },
    select: { id: true, status: true },
  });
  if (!application) return null;
  return { user, application };
}

async function transition(
  applicationId: string,
  from: ApplicationStatus,
  to: ApplicationStatus,
  data: Record<string, unknown>,
) {
  const updated = await prisma.application.updateMany({
    where: { id: applicationId, status: from },
    data: { status: to, ...data },
  });
  if (updated.count === 0) return false;
  await prisma.applicationEvent.create({
    data: {
      applicationId,
      actor: "CANDIDATE",
      type: "status_changed",
      payload: { from, to },
    },
  });
  return true;
}

export type MatchActionResult = { ok: boolean };

/**
 * The candidate's "Continue with this studio" — the product's one emotional
 * beat. For incognito profiles this IS the reveal grant, scoped to this
 * application (= this studio) only.
 */
export async function confirmMatch(
  applicationId: string,
): Promise<MatchActionResult> {
  const ctx = await ownApplication(applicationId);
  if (!ctx || ctx.application.status !== "INTERESTED") return { ok: false };

  const now = new Date();
  const ok = await transition(applicationId, "INTERESTED", "MATCHED", {
    matchedAt: now,
    revealedAt: now,
  });
  if (ok) await capture(ctx.user.id, "match_confirmed");
  return { ok };
}

// Statuses a candidate can walk away from. Terminal states stay terminal.
const WITHDRAWABLE: ApplicationStatus[] = [
  "STARTED",
  "SUBMITTED",
  "IN_REVIEW",
  "INTERESTED",
  "MATCHED",
  "FINAL",
];

/**
 * "Candidate chose not to continue" — dignified, any point, no reason
 * required. Declining an interested studio never leaks identity: for
 * incognito profiles revealedAt is simply never set.
 */
export async function withdrawApplication(
  applicationId: string,
): Promise<MatchActionResult> {
  const ctx = await ownApplication(applicationId);
  if (!ctx || !WITHDRAWABLE.includes(ctx.application.status)) {
    return { ok: false };
  }

  const ok = await transition(
    applicationId,
    ctx.application.status,
    "WITHDRAWN",
    { closedAt: new Date() },
  );
  if (ok) await capture(ctx.user.id, "candidate_withdrew");
  return { ok };
}
