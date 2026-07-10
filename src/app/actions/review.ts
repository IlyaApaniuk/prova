"use server";

import type { ApplicationStatus } from "@prisma/client";
import { getUser } from "@/lib/auth/session";
import { getPostHogServer } from "@/lib/posthog/server";
import { prisma } from "@/lib/prisma";
import { getStudioMemberForUser } from "@/lib/studios";
import {
  type DeclineInput,
  type InterestInput,
  declineSchema,
  interestSchema,
} from "@/lib/validation/review";

// Canonical (English) template texts stored in declineReason; the reason key
// itself travels in the event payload for analytics.
const DECLINE_TEXT: Record<string, string> = {
  experience: "Not enough relevant experience for this role",
  visualization: "Looking for stronger visualization skills",
};

async function capture(distinctId: string, event: string) {
  const posthog = getPostHogServer();
  if (posthog) {
    posthog.capture({ distinctId, event });
    await posthog.flush();
  }
}

/** Loads the application only if it belongs to the caller's studio. */
async function memberApplication(applicationId: string) {
  const user = await getUser();
  if (!user) return null;
  const member = await getStudioMemberForUser(user);
  if (!member) return null;
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      vacancy: { studioId: member.studioId },
      status: { not: "STARTED" },
    },
    select: { id: true, status: true },
  });
  if (!application) return null;
  return { user, member, application };
}

async function transition(
  applicationId: string,
  from: ApplicationStatus,
  to: ApplicationStatus,
  data: Record<string, unknown>,
  payload?: Record<string, unknown>,
) {
  // updateMany + status guard = atomic idempotence: a concurrent duplicate
  // call simply matches zero rows instead of double-writing events.
  const updated = await prisma.application.updateMany({
    where: { id: applicationId, status: from },
    data: { status: to, ...data },
  });
  if (updated.count === 0) return false;
  await prisma.applicationEvent.create({
    data: {
      applicationId,
      actor: "COMPANY",
      type: "status_changed",
      payload: { from, to, ...payload },
    },
  });
  return true;
}

/**
 * First view of a submission flips it to "in review" — zero effort for the
 * studio, an honest signal for the candidate. Fired from a client effect
 * (POST), never from rendering, so prefetching can't fake a review.
 */
export async function markApplicationReviewed(
  applicationId: string,
): Promise<{ changed: boolean }> {
  const ctx = await memberApplication(applicationId);
  if (!ctx || ctx.application.status !== "SUBMITTED") {
    return { changed: false };
  }
  const changed = await transition(applicationId, "SUBMITTED", "IN_REVIEW", {
    reviewedAt: new Date(),
  });
  if (changed) await capture(ctx.user.id, "application_reviewed");
  return { changed };
}

export type ReviewActionResult = { ok: boolean };

export async function markInterested(
  applicationId: string,
  input: InterestInput,
): Promise<ReviewActionResult> {
  const ctx = await memberApplication(applicationId);
  if (!ctx) return { ok: false };
  const parsed = interestSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const from = ctx.application.status;
  if (from !== "SUBMITTED" && from !== "IN_REVIEW") return { ok: false };

  const ok = await transition(
    applicationId,
    from,
    "INTERESTED",
    { interestMessage: parsed.data.message || null },
    parsed.data.message ? { hasMessage: true } : undefined,
  );
  if (ok) await capture(ctx.user.id, "company_interested");
  return { ok };
}

export async function declineApplication(
  applicationId: string,
  input: DeclineInput,
): Promise<ReviewActionResult> {
  const ctx = await memberApplication(applicationId);
  if (!ctx) return { ok: false };
  const parsed = declineSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const from = ctx.application.status;
  if (from !== "SUBMITTED" && from !== "IN_REVIEW" && from !== "INTERESTED") {
    return { ok: false };
  }

  const { reason, note } = parsed.data;
  const template = DECLINE_TEXT[reason];
  const declineReason =
    reason === "other" ? note! : note ? `${template} — ${note}` : template;

  const ok = await transition(
    applicationId,
    from,
    "DECLINED",
    { declineReason, closedAt: new Date() },
    { reason },
  );
  if (ok) await capture(ctx.user.id, "company_declined");
  return { ok };
}
