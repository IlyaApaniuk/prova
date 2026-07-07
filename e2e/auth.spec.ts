import { expect, test } from "@playwright/test";

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
  const mailpit = process.env.MAILPIT_URL ?? "http://127.0.0.1:55324";
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/en/auth/sign-in?next=/en/jobs");
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /send sign-in link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible();

  let messageId = "";
  await expect
    .poll(
      async () => {
        const res = await request.get(
          `${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
        );
        const data = (await res.json()) as { messages?: { ID: string }[] };
        messageId = data.messages?.[0]?.ID ?? "";
        return messageId;
      },
      { timeout: 15_000 },
    )
    .not.toBe("");

  const messageRes = await request.get(
    `${mailpit}/api/v1/message/${messageId}`,
  );
  const message = (await messageRes.json()) as { HTML?: string; Text?: string };
  const body = `${message.HTML ?? ""}\n${message.Text ?? ""}`;
  const link = body
    .match(/https?:\/\/[^\s"'<>]*\/api\/auth\/confirm[^\s"'<>]*/)?.[0]
    ?.replace(/&amp;/g, "&");
  expect(link, "confirm link present in the email").toBeTruthy();

  await page.goto(link!);
  await expect(page).toHaveURL(/\/en\/jobs$/);
  await expect(
    page.getByRole("banner").getByRole("button", { name: /sign out/i }),
  ).toBeVisible();

  // Sign-out redirects to the landing (no session UI there), so check the
  // signed-out header state back on the jobs page.
  await page
    .getByRole("banner")
    .getByRole("button", { name: /sign out/i })
    .click();
  await expect(page).toHaveURL(/\/en$/);
  await page.goto("/en/jobs");
  await expect(
    page.getByRole("banner").getByRole("link", { name: /sign in/i }),
  ).toBeVisible();
});
