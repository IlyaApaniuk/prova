"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { markApplicationReviewed } from "@/app/actions/review";

/**
 * Flips SUBMITTED → IN_REVIEW on the lead's first sight of the work.
 * A client effect firing a POST action: rendering (or link prefetch) alone
 * can never fake a review.
 */
export function MarkReviewed({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void markApplicationReviewed(applicationId).then(({ changed }) => {
      if (changed) router.refresh();
    });
  }, [applicationId, router]);

  return null;
}
