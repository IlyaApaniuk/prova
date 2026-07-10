import { describe, expect, it } from "vitest";
import { declineSchema } from "./review";

describe("declineSchema", () => {
  it("accepts a template reason without a note", () => {
    expect(declineSchema.safeParse({ reason: "experience" }).success).toBe(
      true,
    );
  });

  it("requires a note when the reason is 'other'", () => {
    expect(declineSchema.safeParse({ reason: "other" }).success).toBe(false);
    expect(
      declineSchema.safeParse({ reason: "other", note: "Portfolio direction" })
        .success,
    ).toBe(true);
  });

  it("rejects unknown reasons — declining always needs a real reason", () => {
    expect(declineSchema.safeParse({ reason: "vibes" }).success).toBe(false);
  });
});
