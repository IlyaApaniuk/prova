import { expect, test } from "@playwright/test";
import { signInWithMagicLink } from "./utils";

const SLUG = "nordwind-middle-interior-designer";

test("vacancy CTA sends signed-out visitors through the auth gate", async ({
  page,
}) => {
  await page.goto(`/en/jobs/${SLUG}`);
  await page.getByRole("link", { name: /start the test/i }).click();
  // Generous timeout: in dev the first hit compiles the route.
  await expect(page).toHaveURL(/\/en\/auth\/sign-in\?next=/, {
    timeout: 15_000,
  });
});

// Full candidate journey: auth → profile → start → submit → stepper.
// Needs the local Supabase stack; run with E2E_AUTH=1.
test("candidate applies end to end", async ({ page, request }) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(90_000);
  const email = `apply-${Date.now()}@example.com`;
  const applyPath = `/en/jobs/${SLUG}/apply`;

  await signInWithMagicLink(page, request, email, applyPath);

  // Fresh user → onboarding profile form first.
  await expect(page).toHaveURL(/\/en\/profile\?next=/);
  await page.getByLabel(/first name/i).fill("Test");
  await page.getByLabel(/last name/i).fill("Candidate");
  await page.getByLabel(/^city$/i).fill("Kyiv");
  await page.getByLabel(/country/i).fill("Ukraine");
  await page.getByRole("radio", { name: /1–3 years/i }).click();
  await page.getByRole("button", { name: /^SketchUp$/i }).click();
  await page.getByRole("button", { name: /save and continue/i }).click();

  // Apply page: full brief + explicit start.
  await expect(page).toHaveURL(new RegExp(`${applyPath}$`));
  await expect(page.getByText(/test task/i).first()).toBeVisible();
  await page.getByRole("button", { name: /start the test task/i }).click();

  // Submission form, PDF + link + comment.
  await expect(
    page.getByRole("heading", { name: /submit your work/i }),
  ).toBeVisible();
  await page.locator("#sub-file").setInputFiles({
    name: "work.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n%%EOF\n"),
  });
  await page
    .getByLabel(/link to the work/i)
    .fill("https://www.behance.net/e2e-test");
  await page
    .getByLabel(/comment on the work/i)
    .fill("Layout done in SketchUp.");
  await page.getByRole("button", { name: /submit the work/i }).click();

  // Stepper view: submitted, review is "now".
  await expect(page.getByText(/the studio hasn't opened it yet/i)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/pdf attached/i)).toBeVisible();
  await expect(page.getByText(/behance\.net\/e2e-test/i)).toBeVisible();

  // Vacancy page CTA now reflects the application.
  await page.goto(`/en/jobs/${SLUG}`);
  await expect(
    page.getByRole("link", { name: /view your application/i }),
  ).toBeVisible();
});
