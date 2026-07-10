import { expect, test } from "@playwright/test";
import { applyToVacancy, signInWithMagicLink, signOut } from "./utils";

// Karman on purpose: review.spec runs in a parallel worker and owns the
// Nordwind lead mailbox — single-use magic links must not be shared across
// files.
const SLUG = "karman-3d-visualizer";
const LEAD_EMAIL = "lead@karman.test";

// All tests here sign in to the same lead mailbox — serial, no races.
test.describe.configure({ mode: "serial" });

// The full arc, incognito edition: interest → candidate confirms →
// reveal + contact exchange on both sides. Needs the stack: E2E_AUTH=1.
test("incognito candidate confirms a match and both sides get contacts", async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(150_000);
  const stamp = Date.now();
  const candidateEmail = `match-${stamp}@example.com`;
  const lastName = `Matchee${stamp}`;
  const applyPath = `/en/jobs/${SLUG}/apply`;

  await applyToVacancy(page, request, {
    email: candidateEmail,
    slug: SLUG,
    workLink: `https://www.behance.net/match-${stamp}`,
    lastName,
    incognito: true,
  });
  await signOut(page);

  // Lead: open the newest incognito submission, send interest.
  await signInWithMagicLink(page, request, LEAD_EMAIL, "/en/dashboard");
  await page
    .getByRole("link", { name: /incognito candidate/i })
    .first()
    .click();
  await page.getByRole("button", { name: /^interested$/i }).click();
  await page
    .getByLabel(/message to the candidate/i)
    .fill("Strong zoning rationale.");
  await page.getByRole("button", { name: /send interest/i }).click();
  await expect(page.getByText(/waiting for the candidate/i)).toBeVisible();
  await signOut(page);

  // Candidate: sees the studio's message, the incognito reveal warning,
  // and confirms.
  await signInWithMagicLink(page, request, candidateEmail, applyPath);
  await expect(page.getByText(/strong zoning rationale/i)).toBeVisible();
  await expect(page.getByText(/only with them/i)).toBeVisible();
  await page
    .getByRole("button", { name: /continue with atelier karman/i })
    .click();
  await expect(page.getByText(/direct contact/i)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(LEAD_EMAIL)).toBeVisible();
  await signOut(page);

  // Lead: the candidate is revealed and their email is exchanged.
  await signInWithMagicLink(page, request, LEAD_EMAIL, "/en/dashboard");
  await page.getByRole("link", { name: new RegExp(lastName, "i") }).click();
  await expect(page.getByText(/it's a match/i)).toBeVisible();
  await expect(page.getByText(candidateEmail)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: new RegExp(lastName, "i") }),
  ).toBeVisible();
});

test("candidate can withdraw and the studio sees a dignified close", async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(120_000);
  const stamp = Date.now();
  const lastName = `Withdrawee${stamp}`;

  await applyToVacancy(page, request, {
    email: `wd-${stamp}@example.com`,
    slug: SLUG,
    workLink: `https://www.behance.net/wd-${stamp}`,
    lastName,
  });

  await page.getByRole("button", { name: /withdraw application/i }).click();
  await page.getByRole("button", { name: /yes, close it/i }).click();
  await expect(page.getByText(/you chose not to continue/i)).toBeVisible({
    timeout: 15_000,
  });
  await signOut(page);

  await signInWithMagicLink(page, request, LEAD_EMAIL, "/en/dashboard");
  await page.getByRole("link", { name: new RegExp(lastName, "i") }).click();
  await expect(
    page.getByText(/candidate chose not to continue/i),
  ).toBeVisible();
});
