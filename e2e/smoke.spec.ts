import { expect, test } from "@playwright/test";

test("root redirects to a locale-prefixed path", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|uk|ru|pl)$/);
});

test("landing renders the hero, chapters and waitlist", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByRole("heading", { level: 1, name: /lights on/i }),
  ).toBeVisible();
  await expect(page.locator("#waitlist")).toBeAttached();
  await expect(page.getByPlaceholder("you@email.com")).toBeAttached();
});

test("russian locale renders translated hero", async ({ page }) => {
  await page.goto("/ru");
  await expect(
    page.getByRole("heading", { level: 1, name: /включённом свете/i }),
  ).toBeVisible();
});
