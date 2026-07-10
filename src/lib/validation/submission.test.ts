import { describe, expect, it } from "vitest";
import { submissionSchema } from "./submission";

describe("submissionSchema", () => {
  it("accepts a link alone", () => {
    expect(
      submissionSchema.safeParse({ link: "https://behance.net/x" }).success,
    ).toBe(true);
  });

  it("accepts a file alone", () => {
    expect(
      submissionSchema.safeParse({ filePath: "user/app/work.pdf" }).success,
    ).toBe(true);
  });

  it("rejects an empty submission — the work itself is required", () => {
    expect(submissionSchema.safeParse({ comment: "hi" }).success).toBe(false);
  });

  it("caps the comment at 300 chars (a note, not a cover letter)", () => {
    expect(
      submissionSchema.safeParse({
        link: "https://x.com",
        comment: "a".repeat(301),
      }).success,
    ).toBe(false);
  });
});
