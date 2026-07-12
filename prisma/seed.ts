import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GoTrue admin over plain fetch: supabase-js pulls in realtime, which needs
 * a WebSocket global that Node 20 doesn't have. The seed only needs one
 * idempotent "ensure user" call.
 */
async function ensureAuthUser(
  url: string,
  key: string,
  email: string,
): Promise<string | undefined> {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const created = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, email_confirm: true }),
  });
  if (created.ok) {
    const user = (await created.json()) as { id?: string };
    if (user.id) return user.id;
  }
  const list = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers,
  });
  if (!list.ok) return undefined;
  const data = (await list.json()) as {
    users?: { id: string; email?: string }[];
  };
  return data.users?.find((user) => user.email === email)?.id;
}

/**
 * Demo candidate with mid-path applications, so the whole stepper can be
 * clicked through locally (sign in as candidate@demo.test via Mailpit).
 * Needs the local Supabase stack for the auth user — skipped without env.
 */
async function seedDemoCandidate(vacancies: {
  nordwindId: string;
  karmanId: string;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.log("Skipped demo candidate (no Supabase env)");
    return;
  }

  const email = "candidate@demo.test";
  const userId = await ensureAuthUser(url, key, email);
  if (!userId) {
    console.warn("Could not create/find the demo candidate auth user");
    return;
  }

  const profile = await prisma.candidateProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      firstName: "Demo",
      lastName: "Candidate",
      city: "Kyiv",
      country: "Ukraine",
      experience: "THREE_TO_6",
      software: ["SketchUp", "3ds Max", "Corona"],
      headline: "Interior designer focused on residential projects",
      portfolioLinks: ["https://www.behance.net/demo-candidate"],
    },
  });

  const dayMs = 24 * 60 * 60 * 1000;
  const started = new Date(Date.now() - 6 * dayMs);
  const submitted = new Date(Date.now() - 5 * dayMs);
  const reviewed = new Date(Date.now() - 3 * dayMs);
  const interested = new Date(Date.now() - 1 * dayMs);

  // Nordwind: INTERESTED — sign in as the demo candidate and live the
  // confirm moment yourself.
  await prisma.application.upsert({
    where: {
      vacancyId_candidateId: {
        vacancyId: vacancies.nordwindId,
        candidateId: profile.id,
      },
    },
    update: {},
    create: {
      vacancyId: vacancies.nordwindId,
      candidateId: profile.id,
      status: "INTERESTED",
      submissionLink: "https://www.behance.net/demo-candidate/zoning-32m2",
      submissionComment: "Layout in SketchUp — the brief allowed either tool.",
      interestMessage:
        "Loved how you handled the zoning around the wet areas — let's talk.",
      submittedAt: submitted,
      reviewedAt: reviewed,
      createdAt: started,
      events: {
        create: [
          {
            actor: "CANDIDATE",
            type: "status_changed",
            payload: { from: null, to: "STARTED" },
            createdAt: started,
          },
          {
            actor: "CANDIDATE",
            type: "status_changed",
            payload: { from: "STARTED", to: "SUBMITTED" },
            createdAt: submitted,
          },
          {
            actor: "COMPANY",
            type: "status_changed",
            payload: { from: "SUBMITTED", to: "IN_REVIEW" },
            createdAt: reviewed,
          },
          {
            actor: "COMPANY",
            type: "status_changed",
            payload: { from: "IN_REVIEW", to: "INTERESTED" },
            createdAt: interested,
          },
        ],
      },
    },
  });

  // Karman: IN_REVIEW — the mid-path stepper state.
  await prisma.application.upsert({
    where: {
      vacancyId_candidateId: {
        vacancyId: vacancies.karmanId,
        candidateId: profile.id,
      },
    },
    update: {},
    create: {
      vacancyId: vacancies.karmanId,
      candidateId: profile.id,
      status: "IN_REVIEW",
      submissionLink: "https://www.behance.net/demo-candidate/cafe-render",
      submittedAt: submitted,
      reviewedAt: reviewed,
      createdAt: started,
      events: {
        create: [
          {
            actor: "CANDIDATE",
            type: "status_changed",
            payload: { from: null, to: "STARTED" },
            createdAt: started,
          },
          {
            actor: "CANDIDATE",
            type: "status_changed",
            payload: { from: "STARTED", to: "SUBMITTED" },
            createdAt: submitted,
          },
          {
            actor: "COMPANY",
            type: "status_changed",
            payload: { from: "SUBMITTED", to: "IN_REVIEW" },
            createdAt: reviewed,
          },
        ],
      },
    },
  });

  console.log(`Seeded demo candidate: ${email}`);
}

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

  // Empty third studio: e2e studio-management tests own its lead mailbox
  // exclusively (parallel spec files must never share magic-link inboxes).
  const praxis = await prisma.studio.upsert({
    where: { slug: "studio-praxis" },
    update: {},
    create: {
      slug: "studio-praxis",
      name: "Studio Praxis",
      city: "Warsaw",
      country: "Poland",
      about: "Compact interior practice used for demos and testing.",
      links: {},
      showcase: [],
    },
  });

  await prisma.studioMember.upsert({
    where: { email: "lead@praxis.test" },
    update: {},
    create: {
      studioId: praxis.id,
      email: "lead@praxis.test",
      name: "Ola Nowak",
      role: "Lead designer",
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

  const nordwindVacancy = await prisma.vacancy.upsert({
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

  const karmanVacancy = await prisma.vacancy.upsert({
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

  await seedDemoCandidate({
    nordwindId: nordwindVacancy.id,
    karmanId: karmanVacancy.id,
  });

  console.log("Seeded: 3 studios, 3 leads, 2 published vacancies");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
