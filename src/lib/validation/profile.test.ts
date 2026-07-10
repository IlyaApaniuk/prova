import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const valid = {
  firstName: "Olena",
  lastName: "Kovalenko",
  city: "Kyiv",
  country: "Ukraine",
  experience: "ONE_TO_3",
  software: ["SketchUp", "3ds Max"],
};

describe("profileSchema", () => {
  it("accepts the four required fields alone", () => {
    const parsed = profileSchema.parse(valid);
    expect(parsed.isIncognito).toBe(false);
    expect(parsed.portfolioLinks).toEqual([]);
  });

  it("requires at least one software tag", () => {
    expect(profileSchema.safeParse({ ...valid, software: [] }).success).toBe(
      false,
    );
  });

  it("rejects unknown software tags (must stay matchable)", () => {
    expect(
      profileSchema.safeParse({ ...valid, software: ["MS Paint"] }).success,
    ).toBe(false);
  });

  it("rejects non-url portfolio links", () => {
    expect(
      profileSchema.safeParse({ ...valid, portfolioLinks: ["behance"] })
        .success,
    ).toBe(false);
  });

  it("trims whitespace-only names away", () => {
    expect(
      profileSchema.safeParse({ ...valid, firstName: "   " }).success,
    ).toBe(false);
  });
});
