@AGENTS.md

# prova

Task-first hiring. An interested candidate goes straight to a company's short,
standardized test task — no résumé, no "did they pick me?" wait. The platform
guarantees the task is a neutral skill check, never a slice of real client work.
First goal is validating the approach (landing + waitlist), not building a full
ATS/pipeline builder.

## Commands

- `npm run dev` — dev server (runs `prisma generate` first)
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint (flat config)
- `npm run knip` — dead-code / unused deps
- `npm test` / `npm run test:watch` — Vitest (business logic only)
- `npm run test:e2e` — Playwright chromium smoke
- `npm run format` — Prettier write

CI (`.github/workflows/ci.yml`) runs lint → typecheck → knip → test → build,
plus a separate Playwright smoke job. Pre-commit runs lint-staged.

## Stack

Next.js 16 (App Router, RSC, Turbopack) · React 19 · TS strict · Tailwind 4 +
shadcn/ui (radix, new-york) · next-intl 4 (ru/uk/en/pl) · Prisma 6 → Supabase
Postgres · Supabase Auth (ssr) · PostHog · Vercel Analytics. Deploy: Vercel.

Prisma is pinned to v6 on purpose — v7 requires driver adapters and moves the
datasource URL out of the schema. Don't upgrade without migrating that.

## Design system — locked v0.2

Warm architectural minimalism: warm paper + dark wood + matte graphite + amber
light + one cognac accent. Sharp corners, hairline borders, no floaty shadows.
All tokens live in `src/app/globals.css` (`:root` light / `.dark` dark). Default
theme is **light**; dark is opt-in via the toggle. Use semantic Tailwind classes
(`bg-card`, `text-muted-foreground`, `border-hairline`) and brand tokens
(`bg-cognac`, `text-amber`, `bg-wood`). Fonts: Spectral (serif display), Manrope
(sans UI), Geist Mono (data). Cognac is rare — only actions/"now"/small marks;
the primary action is graphite in light, cognac in dark.

## Conventions

- i18n: pages live under `src/app/[locale]/`; public pages in the
  `(marketing)` route group. Add UI copy to all four
  `src/i18n/messages/*.json`. Routing config in `src/i18n/`. Locale routing
  runs in `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`).
- Server Actions in `src/app/actions/`. Validate with a shared zod schema
  (`src/lib/validation/`) reused by the client form.
- shadcn primitives in `src/components/ui/` (knip-ignored). Providers in
  `src/components/providers/` (`Providers` = theme + posthog). Feature/site
  components in `src/components/<feature>/`.
- Prisma client: import `{ prisma }` from `@/lib/prisma`. Supabase:
  `@/lib/supabase/{client,server}`. Seed: `prisma/seed.ts` (`npx prisma db seed`).
- Directory skeleton (some dirs are placeholders for now): `docs/`, `scripts/`,
  `supabase/`, `public/{images,documents}/`, `src/{content,hooks,stores}/`,
  `src/lib/{email/templates,geo}/`, `src/app/api/{auth,webhooks,cron,og}/`,
  `src/app/[locale]/{auth,dashboard,admin}/`.
- Copy: Russian-primary, write from the candidate's side, active voice.
