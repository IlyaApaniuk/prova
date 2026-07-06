import { expect, test } from "@playwright/test";

test("jobs list renders seeded vacancies", async ({ page }) => {
  await page.goto("/en/jobs");
  await expect(
    page.getByRole("heading", { level: 1, name: /open roles/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /middle interior designer/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /3d visualizer/i }),
  ).toBeVisible();
});

test("vacancy page shows salary, path and JobPosting JSON-LD", async ({
  page,
}) => {
  await page.goto("/en/jobs/nordwind-middle-interior-designer");
  await expect(
    page.getByRole("heading", { level: 1, name: /middle interior designer/i }),
  ).toBeVisible();
  await expect(page.getByText(/2,400/)).toBeVisible();
  await expect(page.getByText(/path to an offer/i)).toBeVisible();

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(jsonLd).toBeTruthy();
  const parsed = JSON.parse(jsonLd!);
  expect(parsed["@type"]).toBe("JobPosting");
  expect(parsed.hiringOrganization.name).toBe("Studio Nordwind");
  expect(parsed.baseSalary.value.minValue).toBe(2400);
});

test("studio page lists its roles", async ({ page }) => {
  await page.goto("/en/studios/studio-nordwind");
  await expect(
    page.getByRole("heading", { level: 1, name: /studio nordwind/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /middle interior designer/i }),
  ).toBeVisible();
});

test("unknown vacancy 404s", async ({ page }) => {
  const response = await page.goto("/en/jobs/nope");
  expect(response?.status()).toBe(404);
});

test("landing links to the jobs list", async ({ page }) => {
  await page.goto("/en");
  await page
    .getByRole("banner")
    .getByRole("link", { name: /open roles/i })
    .click();
  await expect(page).toHaveURL(/\/en\/jobs$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /open roles/i }),
  ).toBeVisible();
});
