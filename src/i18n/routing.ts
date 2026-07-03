import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "uk", "en", "pl"],
  defaultLocale: "ru",
});

export type Locale = (typeof routing.locales)[number];
