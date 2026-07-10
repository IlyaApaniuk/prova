"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { getProfileByUserId } from "@/lib/candidates";
import { getPostHogServer } from "@/lib/posthog/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SUBMISSION_MAX_FILE_BYTES,
  type SubmissionInput,
  submissionSchema,
} from "@/lib/validation/submission";

const SUBMISSIONS_BUCKET = "submissions";

async function capture(
  distinctId: string,
  event: string,
  properties?: Record<string, string>,
) {
  const posthog = getPostHogServer();
  if (posthog) {
    posthog.capture({ distinctId, event, properties });
    await posthog.flush();
  }
}

/**
 * Candidate explicitly clicks "Start the test" on the apply page. A POST-only
 * action so link prefetching can never create applications. STARTED rows are
 * never shown to the studio.
 */
export async function startApplication(vacancySlug: string) {
  const user = await getUser();
  const locale = await getLocale();
  const applyPath = `/${locale}/jobs/${vacancySlug}/apply`;
  if (!user) redirect(applyPath); // page guards re-run and route to sign-in

  const profile = await getProfileByUserId(user.id);
  if (!profile) redirect(applyPath);

  const vacancy = await prisma.vacancy.findUnique({
    where: { slug: vacancySlug },
    select: { id: true, status: true },
  });
  if (!vacancy || vacancy.status !== "PUBLISHED") redirect(applyPath);

  const existing = await prisma.application.findUnique({
    where: {
      vacancyId_candidateId: {
        vacancyId: vacancy.id,
        candidateId: profile.id,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    await prisma.application.create({
      data: {
        vacancyId: vacancy.id,
        candidateId: profile.id,
        status: "STARTED",
        events: {
          create: {
            actor: "CANDIDATE",
            type: "status_changed",
            payload: { from: null, to: "STARTED" },
          },
        },
      },
    });
    await capture(user.id, "test_started", { vacancySlug });
  }

  revalidatePath(applyPath);
  redirect(applyPath);
}

export type UploadUrlResult =
  { ok: true; path: string; token: string } | { ok: false };

/**
 * Signed direct-to-storage upload (Vercel caps request bodies well below
 * 25MB, so the file must never pass through the app server). The bucket is
 * private; this URL is the one-time grant.
 */
export async function createSubmissionUploadUrl(
  applicationId: string,
  fileSize: number,
): Promise<UploadUrlResult> {
  const user = await getUser();
  if (!user) return { ok: false };
  if (
    !Number.isFinite(fileSize) ||
    fileSize <= 0 ||
    fileSize > SUBMISSION_MAX_FILE_BYTES
  ) {
    return { ok: false };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { status: true, candidate: { select: { userId: true } } },
  });
  if (
    !application ||
    application.candidate.userId !== user.id ||
    application.status !== "STARTED"
  ) {
    return { ok: false };
  }

  const admin = createAdminClient();
  // Idempotent: mirrors the bucket declared in supabase/config.toml so the
  // cloud project works without manual dashboard setup.
  await admin.storage
    .createBucket(SUBMISSIONS_BUCKET, {
      public: false,
      fileSizeLimit: SUBMISSION_MAX_FILE_BYTES,
      allowedMimeTypes: ["application/pdf"],
    })
    .catch(() => undefined);

  const path = `${user.id}/${applicationId}/${Date.now()}.pdf`;
  const { data, error } = await admin.storage
    .from(SUBMISSIONS_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return { ok: false };

  return { ok: true, path: data.path, token: data.token };
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "invalid" | "state" | "server" };

export async function submitApplication(
  applicationId: string,
  input: SubmissionInput,
): Promise<SubmitResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { link, filePath, comment } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      status: true,
      candidate: { select: { userId: true } },
      vacancy: { select: { slug: true } },
    },
  });
  if (!application || application.candidate.userId !== user.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (application.status !== "STARTED") {
    return { ok: false, error: "state" };
  }
  if (filePath && !filePath.startsWith(`${user.id}/${applicationId}/`)) {
    return { ok: false, error: "invalid" };
  }

  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        submissionLink: link || null,
        submissionFileUrl: filePath || null,
        submissionComment: comment || null,
        events: {
          create: {
            actor: "CANDIDATE",
            type: "status_changed",
            payload: { from: "STARTED", to: "SUBMITTED" },
          },
        },
      },
    });
    await capture(user.id, "test_submitted", {
      vacancySlug: application.vacancy.slug,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "server" };
  }
}
