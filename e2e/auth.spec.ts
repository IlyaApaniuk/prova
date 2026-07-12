import { expect, test } from "@playwright/test";
import { signInWithMagicLink, signOut } from "./utils";

test("sign-in page renders Google and magic-link options", async ({ page }) => {
  await page.goto("/en/auth/sign-in");
  await expect(
    page.getByRole("heading", { level: 1, name: /sign in/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue with google/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});

test("rejects an invalid email client-side", async ({ page }) => {
  await page.goto("/en/auth/sign-in");
  await page.getByLabel(/email/i).fill("not-an-email");
  await page.getByRole("button", { name: /send sign-in link/i }).click();
  await expect(page.getByText(/valid email/i)).toBeVisible();
});

// The full flow needs the local Supabase stack (`supabase start`) and its
// Mailpit inbox — run with E2E_AUTH=1 locally; CI skips it.
test("magic link signs the user in end to end", async ({ page, request }) => {
  test.skip(
    !process.env.E2E_AUTH,
    "needs the local Supabase stack (E2E_AUTH=1)",
  );
  const email = `e2e-${Date.now()}@example.com`;

  await signInWithMagicLink(page, request, email, "/en/jobs");
  await expect(page).toHaveURL(/\/en\/jobs$/);
  await expect(
    page.getByRole("banner").getByRole("button", { name: /account/i }),
  ).toBeVisible();

  // Sign-out lives in the account menu and redirects to the landing, so
  // check the signed-out header state back on the jobs page.
  await signOut(page);
  await page.goto("/en/jobs");
  await expect(
    page.getByRole("banner").getByRole("link", { name: /sign in/i }),
  ).toBeVisible();
});
