import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation. Add `redirect`, `useRouter`, `getPathname`
// to this destructure as features need them.
export const { Link, usePathname } = createNavigation(routing);
