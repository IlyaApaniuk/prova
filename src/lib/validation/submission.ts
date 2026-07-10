import { z } from "zod";

export const SUBMISSION_MAX_FILE_BYTES = 25 * 1024 * 1024;
export const SUBMISSION_COMMENT_MAX = 300;

// A submission is the work itself: a PDF, a link, or both. The comment is
// the only free text in the whole application — a note about the work,
// never a cover letter.
export const submissionSchema = z
  .object({
    link: z.string().trim().url().max(300).optional().or(z.literal("")),
    filePath: z.string().trim().max(300).optional().or(z.literal("")),
    comment: z
      .string()
      .trim()
      .max(SUBMISSION_COMMENT_MAX)
      .optional()
      .or(z.literal("")),
  })
  .refine((value) => Boolean(value.link || value.filePath), {
    message: "link_or_file_required",
    path: ["link"],
  });

export type SubmissionInput = z.input<typeof submissionSchema>;
