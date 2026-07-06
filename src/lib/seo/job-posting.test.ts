import { describe, expect, it } from "vitest";
import type { VacancyWithStudio } from "@/lib/vacancies";
import { buildJobPostingJsonLd } from "./job-posting";

function makeVacancy(
  overrides: Partial<VacancyWithStudio> = {},
): VacancyWithStudio {
  return {
    id: "v1",
    studioId: "s1",
    slug: "test-role",
    title: "Middle Interior Designer",
    seniority: "MIDDLE",
    format: "HYBRID",
    city: "Berlin",
    employmentType: "full-time",
    salaryMin: 2400,
    salaryMax: 3200,
    currency: "EUR",
    software: ["SketchUp"],
    languages: ["en"],
    descriptionMd: "Role description.",
    briefMd: "Brief.",
    briefFileUrl: null,
    briefPublic: true,
    expectedTimeMin: 90,
    status: "PUBLISHED",
    validThrough: new Date("2026-09-30T23:59:59Z"),
    closeReason: null,
    hiredApplicationId: null,
    createdAt: new Date("2026-07-01T00:00:00Z"),
    updatedAt: new Date("2026-07-01T00:00:00Z"),
    studio: {
      id: "s1",
      slug: "studio",
      name: "Studio Nordwind",
      logoUrl: null,
      city: "Berlin",
      country: "Germany",
      about: null,
      links: { website: "https://example.com" },
      showcase: null,
      createdAt: new Date("2026-07-01T00:00:00Z"),
    },
    ...overrides,
  } as VacancyWithStudio;
}

describe("buildJobPostingJsonLd", () => {
  it("maps required fields and employment type", () => {
    const ld = buildJobPostingJsonLd(makeVacancy());
    expect(ld["@type"]).toBe("JobPosting");
    expect(ld.title).toBe("Middle Interior Designer");
    expect(ld.datePosted).toBe("2026-07-01");
    expect(ld.employmentType).toBe("FULL_TIME");
    expect(ld.validThrough).toBe("2026-09-30T23:59:59.000Z");
    expect(ld.hiringOrganization).toMatchObject({
      name: "Studio Nordwind",
      sameAs: "https://example.com",
    });
    expect(ld.jobLocation).toMatchObject({
      address: { addressLocality: "Berlin", addressCountry: "Germany" },
    });
  });

  it("includes salary range only when published", () => {
    const withSalary = buildJobPostingJsonLd(makeVacancy());
    expect(withSalary.baseSalary).toMatchObject({
      currency: "EUR",
      value: { minValue: 2400, maxValue: 3200, unitText: "MONTH" },
    });

    const withoutSalary = buildJobPostingJsonLd(
      makeVacancy({ salaryMin: null, salaryMax: null, currency: null }),
    );
    expect(withoutSalary.baseSalary).toBeUndefined();
  });

  it("marks remote roles as TELECOMMUTE without a place", () => {
    const ld = buildJobPostingJsonLd(
      makeVacancy({ format: "REMOTE", employmentType: "contract" }),
    );
    expect(ld.jobLocationType).toBe("TELECOMMUTE");
    expect(ld.jobLocation).toBeUndefined();
    expect(ld.employmentType).toBe("CONTRACTOR");
    expect(ld.applicantLocationRequirements).toMatchObject({
      name: "Germany",
    });
  });
});
