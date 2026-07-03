import { expect, test } from "@playwright/test";

test("root redirects to a locale-prefixed path", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(ru|uk|en|pl)$/);
});

test("landing renders the hero and waitlist", async ({ page }) => {
  await page.goto("/ru");
  await expect(
    page.getByRole("heading", { level: 1, name: /оффер/i }),
  ).toBeVisible();
  await expect(page.locator("#waitlist")).toBeVisible();
  await expect(page.getByPlaceholder("you@email.com").first()).toBeVisible();
});
