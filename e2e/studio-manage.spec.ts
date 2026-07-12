import { expect, test } from "@playwright/test";
import { signInWithMagicLink } from "./utils";

// Praxis on purpose: nordwind/karman lead mailboxes belong to the review
// and match specs running in parallel workers.
const LEAD_EMAIL = "lead@praxis.test";

test.describe.configure({ mode: "serial" });

test("mobile menu holds the whole nav behind a burger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/jobs");
  await expect(
    page.getByRole("banner").getByRole("link", { name: /sign in/i }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /menu/i }).click();
  await expect(page.getByRole("menuitem", { name: /sign in/i })).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /open roles/i }),
  ).toBeVisible();
});

test("lead creates, publishes and unpublishes a vacancy", async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(150_000);
  const stamp = Date.now();
  const title = `Concept Designer ${stamp}`;

  await signInWithMagicLink(
    page,
    request,
    LEAD_EMAIL,
    "/en/dashboard/vacancies",
  );
  await expect(page).toHaveURL(/\/en\/dashboard\/vacancies$/, {
    timeout: 15_000,
  });

  await page.getByRole("link", { name: /new vacancy/i }).click();
  await page.getByLabel(/^title$/i).fill(title);
  await page.getByRole("radio", { name: /^hybrid$/i }).click();
  await page.getByRole("button", { name: /^SketchUp$/i }).click();
  await page.getByRole("button", { name: /^EN$/ }).click();
  await page
    .getByLabel(/role description/i)
    .fill(
      "You will own residential concepts end to end, from first sketch to client presentation.",
    );
  await page
    .getByLabel(/test task brief/i)
    .fill(
      "Propose a furniture layout for a 28 m2 studio from the provided plan; deliver a single PDF.",
    );
  await page.getByRole("button", { name: /create draft/i }).click();

  // Redirected to the edit page as a draft; publish it.
  await expect(page.getByText(/only your studio can see it/i)).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: /^publish$/i }).click();
  await expect(page.getByText(/live on the public jobs list/i)).toBeVisible();

  // It's genuinely public now.
  await page.goto("/en/jobs");
  await expect(
    page.getByRole("link", { name: new RegExp(title) }),
  ).toBeVisible();

  // And can be taken down again.
  await page.goBack();
  await page.getByRole("button", { name: /unpublish/i }).click();
  await expect(page.getByText(/only your studio can see it/i)).toBeVisible();
});

test("lead edits the public studio profile", async ({ page, request }) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  test.setTimeout(120_000);
  const about = `Compact interior practice — updated ${Date.now()}.`;

  await signInWithMagicLink(page, request, LEAD_EMAIL, "/en/dashboard/studio");
  await expect(page).toHaveURL(/\/en\/dashboard\/studio$/, {
    timeout: 15_000,
  });

  await page.getByLabel(/about the studio/i).fill(about);
  await page.getByRole("button", { name: /^save$/i }).click();
  await expect(page.getByText(/^saved$/i)).toBeVisible();

  await page.goto("/en/studios/studio-praxis");
  await expect(page.getByText(about)).toBeVisible();
});
