import type { VacancyWithStudio } from "@/lib/vacancies";
import { studioLinks } from "@/lib/vacancies";

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
};

/**
 * Google for Jobs JobPosting structured data.
 * Required: title, description, datePosted, hiringOrganization, jobLocation
 * (or jobLocationType TELECOMMUTE for remote), validThrough recommended,
 * baseSalary recommended — include only when the studio published a range.
 */
export function buildJobPostingJsonLd(vacancy: VacancyWithStudio) {
  const links = studioLinks(vacancy.studio.links);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: vacancy.title,
    description: vacancy.descriptionMd,
    datePosted: vacancy.createdAt.toISOString().slice(0, 10),
    employmentType: EMPLOYMENT_TYPE_MAP[vacancy.employmentType] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: vacancy.studio.name,
      ...(links.website ? { sameAs: links.website } : {}),
      ...(vacancy.studio.logoUrl ? { logo: vacancy.studio.logoUrl } : {}),
    },
    identifier: {
      "@type": "PropertyValue",
      name: "prova",
      value: vacancy.id,
    },
    directApply: true,
  };

  if (vacancy.validThrough) {
    jsonLd.validThrough = vacancy.validThrough.toISOString();
  }

  if (vacancy.format === "REMOTE") {
    jsonLd.jobLocationType = "TELECOMMUTE";
    jsonLd.applicantLocationRequirements = {
      "@type": "Country",
      name: vacancy.studio.country,
    };
  } else {
    jsonLd.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: vacancy.city ?? vacancy.studio.city,
        addressCountry: vacancy.studio.country,
      },
    };
  }

  if (vacancy.salaryMin && vacancy.currency) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: vacancy.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: vacancy.salaryMin,
        ...(vacancy.salaryMax ? { maxValue: vacancy.salaryMax } : {}),
        unitText: "MONTH",
      },
    };
  }

  return jsonLd;
}
