import { expect, test } from "@playwright/test";
import { applyToVacancy, signInWithMagicLink, signOut } from "./utils";

const SLUG = "nordwind-middle-interior-designer";
const LEAD_EMAIL = "lead@nordwind.test";

// Both tests sign in to the same lead mailbox — run serially so the
// single-use magic links can't race each other.
test.describe.configure({ mode: "serial" });

test("dashboard is gated to studio members", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/auth\/sign-in\?next=/);
});

// Studio loop: candidate submits → lead sees it, first view flips to
// in-review, sends interest. Needs the local stack: E2E_AUTH=1.
test("lead reviews a submission and sends interest", async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(120_000);
  const stamp = Date.now();
  const candidateEmail = `cand-${stamp}@example.com`;
  const lastName = `Reviewee${stamp}`;
  const workLink = `https://www.behance.net/review-${stamp}`;

  await applyToVacancy(page, request, {
    email: candidateEmail,
    slug: SLUG,
    workLink,
    lastName,
  });
  await signOut(page);

  await signInWithMagicLink(page, request, LEAD_EMAIL, "/en/dashboard");
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // Open this run's submission — first view marks it in review.
  await page.getByRole("link", { name: new RegExp(lastName, "i") }).click();
  await expect(page.getByText(/in review/i).first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(workLink)).toBeVisible();

  // Profile waits behind the tab.
  await page.getByRole("tab", { name: /profile/i }).click();
  await expect(page.getByText(/kyiv, ukraine/i)).toBeVisible();

  await page.getByRole("button", { name: /^interested$/i }).click();
  await page
    .getByLabel(/message to the candidate/i)
    .fill("Loved how you handled the zoning.");
  await page.getByRole("button", { name: /send interest/i }).click();
  await expect(page.getByText(/waiting for the candidate/i)).toBeVisible();

  // Candidate side reflects it.
  await signOut(page);
  await signInWithMagicLink(
    page,
    request,
    candidateEmail,
    `/en/jobs/${SLUG}/apply`,
  );
  await expect(page.getByText(/studio is interested/i)).toBeVisible();
});

test("lead declines an incognito candidate with a reason", async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(120_000);
  const candidateEmail = `incog-${Date.now()}@example.com`;

  await applyToVacancy(page, request, {
    email: candidateEmail,
    slug: SLUG,
    workLink: `https://www.behance.net/incog-${Date.now()}`,
    incognito: true,
  });
  await signOut(page);

  await signInWithMagicLink(page, request, LEAD_EMAIL, "/en/dashboard");
  await page
    .getByRole("link", { name: /incognito candidate/i })
    .first()
    .click();

  // Identity is masked: no name, no portfolio, explanation shown.
  await page.getByRole("tab", { name: /profile/i }).click();
  await expect(page.getByText(/stay hidden until they confirm/i)).toBeVisible();
  await expect(page.getByText(/test candidate/i)).toHaveCount(0);

  await page.getByRole("button", { name: /^decline$/i }).click();
  await page.getByRole("radio", { name: /stronger visualization/i }).click();
  await page.getByRole("button", { name: /send decline/i }).click();
  await expect(page.getByText(/declined with reason/i)).toBeVisible({
    timeout: 15_000,
  });

  // Candidate sees the closed state — worded as an answer, not silence.
  await signOut(page);
  await signInWithMagicLink(
    page,
    request,
    candidateEmail,
    `/en/jobs/${SLUG}/apply`,
  );
  await expect(page.getByText(/decided not to continue/i)).toBeVisible();
});
