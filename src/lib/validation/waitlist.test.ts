import { describe, expect, it } from "vitest";
import { waitlistSchema } from "./waitlist";

describe("waitlistSchema", () => {
  it("accepts a valid candidate signup", () => {
    const result = waitlistSchema.safeParse({
      email: "designer@example.com",
      role: "candidate",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = waitlistSchema.safeParse({
      email: "not-an-email",
      role: "company",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown role", () => {
    const result = waitlistSchema.safeParse({
      email: "lead@example.com",
      role: "recruiter",
    });
    expect(result.success).toBe(false);
  });
});
