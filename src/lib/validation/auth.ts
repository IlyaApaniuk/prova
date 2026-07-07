import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
});

export type SignInInput = z.infer<typeof signInSchema>;
