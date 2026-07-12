import { describe, expect, it } from "vitest";
import { vacancySchema } from "./studio";

const valid = {
  title: "Middle Interior Designer",
  seniority: "MIDDLE",
  format: "HYBRID",
  employmentType: "full-time",
  software: ["SketchUp"],
  languages: ["en"],
  descriptionMd: "A long enough description of the role to pass validation.",
  briefMd: "A long enough neutral test brief to pass validation checks.",
  briefPublic: true,
  expectedTimeMin: 90,
};

describe("vacancySchema", () => {
  it("accepts a vacancy without salary", () => {
    expect(vacancySchema.safeParse(valid).success).toBe(true);
  });

  it("requires a currency once a salary is given", () => {
    expect(vacancySchema.safeParse({ ...valid, salaryMin: 2000 }).success).toBe(
      false,
    );
    expect(
      vacancySchema.safeParse({ ...valid, salaryMin: 2000, currency: "EUR" })
        .success,
    ).toBe(true);
  });

  it("rejects an inverted salary range", () => {
    expect(
      vacancySchema.safeParse({
        ...valid,
        salaryMin: 3000,
        salaryMax: 2000,
        currency: "EUR",
      }).success,
    ).toBe(false);
  });

  it("caps expected time at 4 hours — honest timings are policy", () => {
    expect(
      vacancySchema.safeParse({ ...valid, expectedTimeMin: 300 }).success,
    ).toBe(false);
    expect(
      vacancySchema.safeParse({ ...valid, expectedTimeMin: 10 }).success,
    ).toBe(false);
  });

  it("coerces numeric form strings", () => {
    const parsed = vacancySchema.parse({
      ...valid,
      expectedTimeMin: "120",
      salaryMin: "1800",
      currency: "EUR",
    });
    expect(parsed.expectedTimeMin).toBe(120);
    expect(parsed.salaryMin).toBe(1800);
  });
});
