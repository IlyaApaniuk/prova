"use client";

import { Menu, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { signOut } from "@/app/actions/auth";
import { Link } from "@/i18n/navigation";

const triggerClass =
  "border-border text-foreground hover:border-foreground data-[state=open]:border-foreground focus-visible:outline-cognac inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2";
const contentClass =
  "border-border bg-popover text-popover-foreground z-50 min-w-52 border p-1";
const itemClass =
  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground text-muted-foreground flex w-full cursor-pointer items-center px-2.5 py-2 font-mono text-[0.7rem] tracking-[0.08em] uppercase outline-none";

/** Signed-in account dropdown (desktop): identity, profile, sign out. */
export function AccountMenu({
  email,
  isMember,
}: {
  email: string;
  isMember: boolean;
}) {
  const t = useTranslations("Nav");
  const tAuth = useTranslations("Auth");
  const tDashboard = useTranslations("Dashboard");

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className={triggerClass} aria-label={t("account")}>
        <UserRound className="size-3.5" aria-hidden />
        <span className="max-w-[12ch] truncate normal-case">{email}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" sideOffset={8} className={contentClass}>
        <DropdownMenu.Label className="text-taupe px-2.5 py-2 font-mono text-[0.66rem] break-all normal-case">
          {email}
        </DropdownMenu.Label>
        <DropdownMenu.Separator className="bg-border my-1 h-px" />
        <DropdownMenu.Item asChild>
          <Link href="/profile" className={itemClass}>
            {t("profile")}
          </Link>
        </DropdownMenu.Item>
        {isMember ? (
          <DropdownMenu.Item asChild>
            <Link href="/dashboard" className={itemClass}>
              {tDashboard("navTitle")}
            </Link>
          </DropdownMenu.Item>
        ) : null}
        <DropdownMenu.Separator className="bg-border my-1 h-px" />
        <DropdownMenu.Item className={itemClass} onSelect={() => signOut()}>
          {tAuth("signOutCta")}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

/** Compact site menu for small screens — the whole nav behind one button. */
export function MobileMenu({
  signedIn,
  isMember,
}: {
  signedIn: boolean;
  isMember: boolean;
}) {
  const t = useTranslations("Nav");
  const tJobs = useTranslations("Jobs");
  const tAuth = useTranslations("Auth");
  const tDashboard = useTranslations("Dashboard");

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className={triggerClass} aria-label={t("menu")}>
        <Menu className="size-4" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" sideOffset={8} className={contentClass}>
        <DropdownMenu.Item asChild>
          <Link href="/jobs" className={itemClass}>
            {tJobs("listTitle")}
          </Link>
        </DropdownMenu.Item>
        {isMember ? (
          <DropdownMenu.Item asChild>
            <Link href="/dashboard" className={itemClass}>
              {tDashboard("navTitle")}
            </Link>
          </DropdownMenu.Item>
        ) : null}
        {signedIn ? (
          <>
            <DropdownMenu.Item asChild>
              <Link href="/profile" className={itemClass}>
                {t("profile")}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="bg-border my-1 h-px" />
            <DropdownMenu.Item className={itemClass} onSelect={() => signOut()}>
              {tAuth("signOutCta")}
            </DropdownMenu.Item>
          </>
        ) : (
          <DropdownMenu.Item asChild>
            <Link href="/auth/sign-in" className={itemClass}>
              {tAuth("signInCta")}
            </Link>
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
