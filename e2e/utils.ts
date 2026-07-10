import { type APIRequestContext, type Page, expect } from "@playwright/test";

export const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:55324";

/**
 * Runs the real magic-link sign-in against the local Supabase stack:
 * requests a link from the sign-in page, pulls the email out of Mailpit and
 * follows the confirm URL. Requires `supabase start` (gate specs with
 * E2E_AUTH=1).
 */
async function newestMessageId(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  const res = await request.get(
    `${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
  );
  const data = (await res.json()) as { messages?: { ID: string }[] };
  return data.messages?.[0]?.ID ?? "";
}

export async function signInWithMagicLink(
  page: Page,
  request: APIRequestContext,
  email: string,
  nextPath: string,
) {
  // Snapshot the inbox first: reused addresses (the studio lead) accumulate
  // messages across runs, and magic links are single-use — we must wait for
  // the message this sign-in generates, not grab the latest one blindly.
  const before = await newestMessageId(request, email);

  await page.goto(`/en/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /send sign-in link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible();

  let messageId = "";
  await expect
    .poll(
      async () => {
        const id = await newestMessageId(request, email);
        messageId = id !== before ? id : "";
        return messageId;
      },
      { timeout: 15_000 },
    )
    .not.toBe("");

  const messageRes = await request.get(
    `${MAILPIT_URL}/api/v1/message/${messageId}`,
  );
  const message = (await messageRes.json()) as { HTML?: string; Text?: string };
  const body = `${message.HTML ?? ""}\n${message.Text ?? ""}`;
  const link = body
    .match(/https?:\/\/[^\s"'<>]*\/api\/auth\/confirm[^\s"'<>]*/)?.[0]
    ?.replace(/&amp;/g, "&");
  expect(link, "confirm link present in the email").toBeTruthy();

  await page.goto(link!);
}

/**
 * Full candidate journey against seeded data: sign in, fill the onboarding
 * profile, start the test and submit a link. Leaves the application in
 * SUBMITTED. Assumes a fresh (unknown) email.
 */
export async function applyToVacancy(
  page: Page,
  request: APIRequestContext,
  options: {
    email: string;
    slug: string;
    workLink: string;
    lastName?: string;
    incognito?: boolean;
  },
) {
  const applyPath = `/en/jobs/${options.slug}/apply`;
  await signInWithMagicLink(page, request, options.email, applyPath);

  await expect(page).toHaveURL(/\/en\/profile\?next=/);
  await page.getByLabel(/first name/i).fill("Test");
  await page.getByLabel(/last name/i).fill(options.lastName ?? "Candidate");
  await page.getByLabel(/^city$/i).fill("Kyiv");
  await page.getByLabel(/country/i).fill("Ukraine");
  await page.getByRole("radio", { name: /1–3 years/i }).click();
  await page.getByRole("button", { name: /^SketchUp$/i }).click();
  if (options.incognito) {
    await page.getByRole("checkbox").check();
  }
  await page.getByRole("button", { name: /save and continue/i }).click();

  await expect(page).toHaveURL(new RegExp(`${applyPath}$`));
  await page.getByRole("button", { name: /start the test/i }).click();
  await expect(
    page.getByRole("heading", { name: /submit your work/i }),
  ).toBeVisible();
  await page.getByLabel(/link to the work/i).fill(options.workLink);
  await page.getByRole("button", { name: /submit the work/i }).click();
  await expect(page.getByText(/hasn't opened it yet/i)).toBeVisible({
    timeout: 15_000,
  });
}

/** Header sign-out (works from any page with the app header). */
export async function signOut(page: Page) {
  await page.goto("/en/jobs");
  await page
    .getByRole("banner")
    .getByRole("button", { name: /sign out/i })
    .click();
  await expect(page).toHaveURL(/\/en$/);
}
