import { z } from "zod";

export const waitlistRoles = ["candidate", "company"] as const;

export const waitlistSchema = z.object({
  email: z.string().email(),
  role: z.enum(waitlistRoles),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
