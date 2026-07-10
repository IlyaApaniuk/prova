import { type APIRequestContext, type Page, expect } from "@playwright/test";

export const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:55324";

/**
 * Runs the real magic-link sign-in against the local Supabase stack:
 * requests a link from the sign-in page, pulls the email out of Mailpit and
 * follows the confirm URL. Requires `supabase start` (gate specs with
 * E2E_AUTH=1).
 */
export async function signInWithMagicLink(
  page: Page,
  request: APIRequestContext,
  email: string,
  nextPath: string,
) {
  await page.goto(`/en/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /send sign-in link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible();

  let messageId = "";
  await expect
    .poll(
      async () => {
        const res = await request.get(
          `${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
        );
        const data = (await res.json()) as { messages?: { ID: string }[] };
        messageId = data.messages?.[0]?.ID ?? "";
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
