import { z } from "zod";

// Decline templates per spec; "other" requires the free-text note. A decline
// without a reason does not exist — silent rejection is not a state.
export const declineReasons = ["experience", "visualization", "other"] as const;

export const declineSchema = z
  .object({
    reason: z.enum(declineReasons),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((value) => value.reason !== "other" || Boolean(value.note), {
    message: "note_required",
    path: ["note"],
  });

export type DeclineInput = z.input<typeof declineSchema>;

export const interestSchema = z.object({
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

export type InterestInput = z.input<typeof interestSchema>;
