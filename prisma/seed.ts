import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Dev seed: fictional pilot-shaped data (real studio names only land after
 * agreements are signed). Idempotent — upserts by slug.
 */
async function main() {
  const nordwind = await prisma.studio.upsert({
    where: { slug: "studio-nordwind" },
    update: {},
    create: {
      slug: "studio-nordwind",
      name: "Studio Nordwind",
      city: "Berlin",
      country: "Germany",
      about:
        "Boutique interior studio focused on residential projects across Europe. Small team, high bar, no bureaucracy.",
      links: { website: "https://example.com", instagram: "@studio.nordwind" },
      showcase: [],
    },
  });

  const karman = await prisma.studio.upsert({
    where: { slug: "atelier-karman" },
    update: {},
    create: {
      slug: "atelier-karman",
      name: "Atelier Karman",
      city: "Kyiv",
      country: "Ukraine",
      about:
        "Architecture and interiors atelier working on hospitality and premium residential. Async-friendly process.",
      links: { website: "https://example.com" },
      showcase: [],
    },
  });

  // Studio leads — linked to Supabase auth by email on their first sign-in.
  await prisma.studioMember.upsert({
    where: { email: "lead@nordwind.test" },
    update: {},
    create: {
      studioId: nordwind.id,
      email: "lead@nordwind.test",
      name: "Anna Weber",
      role: "Senior interior designer",
    },
  });

  await prisma.studioMember.upsert({
    where: { email: "lead@karman.test" },
    update: {},
    create: {
      studioId: karman.id,
      email: "lead@karman.test",
      name: "Taras Karman",
      role: "Founder, lead architect",
    },
  });

  await prisma.vacancy.upsert({
    where: { slug: "nordwind-middle-interior-designer" },
    update: {},
    create: {
      studioId: nordwind.id,
      slug: "nordwind-middle-interior-designer",
      title: "Middle Interior Designer",
      seniority: "MIDDLE",
      format: "HYBRID",
      city: "Berlin",
      employmentType: "full-time",
      salaryMin: 2400,
      salaryMax: 3200,
      currency: "EUR",
      software: ["SketchUp", "3ds Max", "Corona", "AutoCAD"],
      languages: ["en", "de"],
      descriptionMd:
        "We are looking for a middle interior designer for residential projects: concept to construction documentation. You will own 2–3 apartments at a time and present directly to clients together with the lead.",
      briefMd:
        "Zoning concept for a 32 m² studio apartment. We provide the floor plan with fixed wet zones; propose a zoning scheme, one furniture layout and a short (≤5 sentences) rationale. Any tool — export a single PDF. This is a neutral exercise, not a client project.",
      briefPublic: true,
      expectedTimeMin: 90,
      status: "PUBLISHED",
      validThrough: new Date("2026-09-30T23:59:59Z"),
    },
  });

  await prisma.vacancy.upsert({
    where: { slug: "karman-3d-visualizer" },
    update: {},
    create: {
      studioId: karman.id,
      slug: "karman-3d-visualizer",
      title: "3D Visualizer",
      seniority: "MIDDLE",
      format: "REMOTE",
      employmentType: "contract",
      salaryMin: null,
      salaryMax: null,
      currency: null,
      software: ["3ds Max", "Corona", "V-Ray", "Photoshop"],
      languages: ["uk", "en"],
      descriptionMd:
        "Remote 3D visualizer for hospitality interiors. Batch work: 6–10 camera renders per project, moodboard-driven, tight but predictable deadlines.",
      briefMd:
        "One camera render of a small café corner from a provided SketchUp scene and moodboard. Lighting and materials are yours; keep post-production light. Deliver a single 1920px JPEG + one line about your lighting choice. Neutral exercise — not a client scene.",
      briefPublic: true,
      expectedTimeMin: 120,
      status: "PUBLISHED",
      validThrough: new Date("2026-09-30T23:59:59Z"),
    },
  });

  console.log("Seeded: 2 studios, 2 leads, 2 published vacancies");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
