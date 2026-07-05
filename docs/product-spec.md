# prova — Product Spec v1 (pilot)

_Last updated: 2026-07-05. This is the canonical product decision record for the
pilot release. Supersedes anything implied by the placeholder landing._

## One-liner

Task-first hiring. An interested candidate goes straight to a company's short,
standardized test task — no résumé gate, no "did they even look?" limbo. The
platform guarantees the task is a neutral skill check and keeps every stage of
the process lit up for both sides.

## Thesis

- The **test task is the gate**. The CV is demoted from gatekeeper to context:
  a light profile the company sees alongside/after the work, never a
  precondition judged in silence.
- The platform is the **candidate's advocate**: no black box, no ghosting by
  construction, honest timings.
- For companies the pitch is a **better shortlist with less noise**: everyone
  in the review queue has already done the work.

## Pilot

Two Kyiv-based high-end interior design studios (direct competitors — data is
strictly isolated per studio):

1. **Yodezeen** — warm intro, vacancies promised.
2. **Hilight** — to be pitched ("Yodezeen is already in" as leverage).

Traffic comes from the studios' own channels (their IG/site/job posts link to
prova) + Google for Jobs via structured data. prova has no audience of its own
yet — this is a negotiated commitment, not a hope.

- Default locale: **en** (global ambition). uk/ru/pl available. Vacancy content
  stays in whatever language the studio writes it (canonical per vacancy).
- Domain: **prova.careers**.
- Pilot is free for studios. Monetization later, **companies only** — we never
  charge candidates (paid incognito was considered and vetoed).

---

## Candidate flow

```
Browse vacancies (public, SEO)
  → "Start test task" (auth gate: Supabase magic link)
  → Profile (first time only, ~60–90s)
  → Test brief → do the work → Submit (PDF ≤25MB and/or link, + optional comment on the work)
  → Stepper: Submitted → In review → Match? → Direct contact → Outcome
```

### Profile (there is no "CV" in the product)

Fill-once, reused across all applications. The word "résumé/CV" never appears
in UI as a requirement.

**Required (4 fields, one screen):**

| Field          | Form                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| Name + surname | text (needed for reveal at match)                                                      |
| City + country | text/select                                                                            |
| Experience     | band select: <1 / 1–3 / 3–6 / 6+ years                                                 |
| Software       | tag multi-select (Revit, ArchiCAD, SketchUp, 3ds Max, Corona/V-Ray, Enscape, AutoCAD…) |

**Optional (more signal, zero pressure):** portfolio links, one-line headline,
employment history rows (title / studio / years), PDF CV attach (never parsed,
shown in the profile tab only), photo.

**No cover letters, ever.** Motivation is proven by the completed test. The
only free-text at submission is an optional _comment on the work_ (≤300 chars,
e.g. "layout done in SketchUp, brief allowed either").

### Incognito

Default = **open**. Closing is free (forever — monetization never touches
this). Reveal is a **per-studio grant** that happens at match, not a global
toggle flip.

| Profile field                               | Open | Incognito (before match)        |
| ------------------------------------------- | ---- | ------------------------------- |
| Name, photo                                 | ✓    | —                               |
| City, experience band, software, job titles | ✓    | ✓                               |
| Employer names in history                   | ✓    | —                               |
| Portfolio links                             | ✓    | — (they de-anonymize instantly) |
| PDF CV                                      | ✓    | —                               |
| The test work itself                        | ✓    | ✓                               |

At upload, incognito candidates see a checklist: "remove your name and
identifying projects from the PDF". We sell _incognito_, not magic anonymity —
copy must stay honest about this.

### Match mechanic (the reveal moment)

1. Lead reviews the work (review UI shows **the test first**, profile behind a
   tab — soft blind review by layout, not by rule).
2. Company clicks **"Interested"** and may attach a short human message
   ("loved how you handled the zoning").
3. Candidate **confirms** ("Continue with this studio"). Confirmation is
   required for _all_ profiles — it gives us the mutual-interest metric,
   filters ghosting before anyone schedules a call, and is the product's one
   emotional beat. For incognito profiles, confirming **is** the reveal grant
   to that studio only.
4. Match: contacts are exchanged (candidate email ↔ lead email). The platform
   steps back but keeps tracking the outcome.

Candidate declining = "candidate chose not to continue" — dignified, no
identity leaked, thread closed as `withdrawn`.

### Review wait — no promised deadlines, three mechanisms instead

We deliberately do **not** promise "review in ≤3 days" (we can't control it).
Instead:

1. **Live status** — "in review" flips automatically on the lead's first view
   of the submission (zero effort for the company).
2. **Public accountability** — each studio's page and vacancies show its
   _median response time_ and _% of applications answered_, computed from the
   event log. This replaces the promise with reputation pressure.
3. **The platform pings** — after N days of silence we auto-remind the studio;
   the candidate sees "we've nudged them about your work".

---

## Application state machine

```
started ──→ submitted ──→ in_review ──→ interested ──→ matched ──→ final ──┬─→ hired
   │             │             │             │                             ├─→ declined   (company; reason REQUIRED)
   │             │             │             │                             ├─→ withdrawn  (candidate, any point)
   └─(abandoned) └─────────────┴─────────────┴─────────────────────────────┴─→ expired    (timeout; NEVER shown/counted as rejection)
```

- `started` — candidate clicked "Start test" but hasn't submitted. **Never
  visible to the company** (no pressure, no noise). Gentle reminder email at
  day 7.
- `declined` — requires a reason (templates: "not enough residential
  experience", "looking for stronger visualization", + free text). The
  candidate **always** gets an answer. Silent rejection does not exist as a
  state.
- `expired` — ~45 days of silence at any post-submission stage → separate
  terminal state, reported separately in all stats, with an apology to the
  candidate. It hits the studio's public response stats. **Timeout ≠
  rejection** — mixing them would poison every metric we sell.
- Re-applying to the same vacancy after a terminal state: blocked.
- One application per (vacancy, candidate) — DB unique constraint.

**Every transition is written to `ApplicationEvent`** (who, what, when,
payload). All analytics — funnel per stage, time-in-stage, % mutual interest,
studio medians, "how far did I get" — are queries over this log, not features.

### Outcome detection (FINAL → hired/declined/expired)

Layered, cheapest first:

1. **One-click status updates** for both sides directly from email via
   tokenized links (no login): "Still talking / Offer / Rejected".
2. **Nudges** at day 7 / 14 / 28 of silence.
3. **Vacancy-close chokepoint** — closing a vacancy (a natural action) asks:
   _hired a prova candidate (who?) / hired elsewhere / cancelled_. The most
   reliable truth signal because it piggybacks an existing habit.
4. **Cross-confirm** — one side reports an outcome → the other gets 7 days to
   dispute, then it's recorded.
5. **Timeout** — 45 days of silence → `expired`.

---

## Company side (v1)

| Block            | Contents                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Studio page      | Logo, about, city, links, **project showcase** (a studio's portfolio _is_ its employer brand), public response stats (median time, % answered)                                                                                                                                                                                      |
| Vacancy          | Title, seniority, employment type, format (office/hybrid/remote) + city, **salary range optional** (we show the SEO argument — salary'd listings rank higher in Google for Jobs — but don't force it), software tags, languages, rich description, `validThrough`                                                                   |
| Test task        | Brief (text + optional PDF attachment), honest expected time (platform policy caps at what's truly doable; no "40 min" for 3-hour work), what to submit (PDF/link), **brief public by default** with per-vacancy toggle "show after apply", neutral-task policy badge ("standardized by prova — never a slice of real client work") |
| Pipeline preview | Fixed 4 steps with timings shown to candidates. **No pipeline builder in v1.**                                                                                                                                                                                                                                                      |
| Reviewer         | Name + role (+ optional photo) of the lead who reviews — "Artem, senior designer, will review your work" humanizes and disciplines                                                                                                                                                                                                  |
| Applications     | List by status, inline PDF viewer, actions: Interested (+message) / Decline (reason required)                                                                                                                                                                                                                                       |
| Notifications    | Email to lead on new submission; email to candidate on every status change                                                                                                                                                                                                                                                          |

One login per studio in v1 (no team seats/roles).

## SEO

- `JobPosting` structured data on every vacancy from day one (required:
  title, description, datePosted, hiringOrganization, jobLocation/-Type,
  validThrough; recommended: baseSalary — include when the studio provides a
  range).
- Vacancy pages are public, static-friendly, canonical in the studio's
  language.

## Metrics (PostHog + event log)

Funnel: `vacancy_view → apply_click → auth_completed → profile_completed →
test_started → test_submitted → reviewed → interested → matched → outcome`.

Derived: completion rate started→submitted (pilot target ≥60–70%), studio
median response time, % answered, % mutual interest (matched/submitted),
time-to-first-signal for candidates, stage reached per application.

Pilot success = completion target hit, medians hold without manual chasing,
≥1 candidate reaches `final` per studio, leads say the shortlist beats
CV-screening, candidates cite transparency unprompted.

## Explicitly NOT in v1

Pipeline builder · team seats · in-platform chat (post-match = direct email) ·
scorecards · proctoring (interior review is manual) · billing · candidate
search/browse for companies (we are vacancy-first, not a talent pool) ·
CV parsing · re-apply after decline · mobile apps.

---

## Data model (Prisma sketch — implemented in the Phase 1 schema branch)

```prisma
enum ExperienceBand { UNDER_1  ONE_TO_3  THREE_TO_6  SIX_PLUS }
enum Seniority      { JUNIOR  MIDDLE  SENIOR  LEAD }
enum WorkFormat     { OFFICE  HYBRID  REMOTE }
enum VacancyStatus  { DRAFT  PUBLISHED  CLOSED }
enum VacancyCloseReason { HIRED_VIA_PROVA  HIRED_ELSEWHERE  CANCELLED }
enum ApplicationStatus {
  STARTED  SUBMITTED  IN_REVIEW  INTERESTED  MATCHED  FINAL
  HIRED  DECLINED  WITHDRAWN  EXPIRED
}
enum EventActor { CANDIDATE  COMPANY  SYSTEM }

model CandidateProfile {
  id             String   @id @default(cuid())
  userId         String   @unique            // Supabase auth user
  firstName      String
  lastName       String
  photoUrl       String?
  city           String
  country        String
  experience     ExperienceBand
  software       String[]
  headline       String?
  portfolioLinks String[]
  cvFileUrl      String?
  isIncognito    Boolean  @default(false)
  employment     Json?    // [{ title, company, years }] — optional rows
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  applications   Application[]
}

model Studio {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  logoUrl   String?
  city      String
  country   String
  about     String?
  links     Json?
  showcase  Json?    // [{ imageUrl, title }]
  createdAt DateTime @default(now())
  members   StudioMember[]
  vacancies Vacancy[]
}

model StudioMember {
  id       String @id @default(cuid())
  studioId String
  userId   String @unique   // one login per studio in v1
  name     String
  role     String?          // "Senior designer" — shown as reviewer
  photoUrl String?
  studio   Studio @relation(fields: [studioId], references: [id])
}

model Vacancy {
  id             String        @id @default(cuid())
  studioId       String
  slug           String        @unique
  title          String
  seniority      Seniority
  format         WorkFormat
  city           String?
  employmentType String        // full-time / part-time / contract
  salaryMin      Int?
  salaryMax     Int?
  currency       String?
  software       String[]
  languages      String[]
  descriptionMd  String
  briefMd        String
  briefFileUrl   String?
  briefPublic    Boolean       @default(true)
  expectedTimeMin Int          // honest minutes
  status         VacancyStatus @default(DRAFT)
  validThrough   DateTime?
  closeReason    VacancyCloseReason?
  hiredApplicationId String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  studio         Studio        @relation(fields: [studioId], references: [id])
  applications   Application[]

  @@index([status])
}

model Application {
  id                String            @id @default(cuid())
  vacancyId         String
  candidateId       String
  status            ApplicationStatus @default(STARTED)
  submissionFileUrl String?
  submissionLink    String?
  submissionComment String?
  interestMessage   String?           // company → candidate, at "interested"
  declineReason     String?           // required when DECLINED
  revealedAt        DateTime?         // incognito reveal grant (per application = per studio)
  submittedAt       DateTime?
  reviewedAt        DateTime?         // first lead view
  matchedAt         DateTime?
  closedAt          DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  vacancy           Vacancy           @relation(fields: [vacancyId], references: [id])
  candidate         CandidateProfile  @relation(fields: [candidateId], references: [id])
  events            ApplicationEvent[]

  @@unique([vacancyId, candidateId])
  @@index([status])
}

model ApplicationEvent {
  id            String      @id @default(cuid())
  applicationId String
  actor         EventActor
  type          String      // status_changed, nudge_sent, outcome_reported, …
  payload       Json?
  createdAt     DateTime    @default(now())
  application   Application @relation(fields: [applicationId], references: [id])

  @@index([applicationId, createdAt])
}

// WaitlistSignup (already live) stays as-is.
```

## Phase 1 build order (branches)

1. `feat/db-schema` — schema above + migration + seed (2 studios, 2 vacancies)
2. `feat/auth` — magic link (Supabase), locale-aware
3. `feat/vacancy-pages` — public studio + vacancy pages, JobPosting JSON-LD, en default locale switch
4. `feat/apply-flow` — profile form, brief, submission (Storage upload + link), started/submitted states
5. `feat/review-flow` — studio login, applications list, PDF viewer, interested/decline + reasons
6. `feat/match-flow` — candidate confirm, reveal grant, contact exchange, FINAL
7. `feat/emails` — Resend + react-email: all notifications + tokenized outcome links
8. `feat/outcome` — nudges (Vercel cron), expiry job, vacancy-close chokepoint
9. `feat/landing-v2` — "lights on" scroll landing (lamp keyframes, Tier 1)

Each branch ships behind green CI; landing-v2 can run in parallel with 5–8.
