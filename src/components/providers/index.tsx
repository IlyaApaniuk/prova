"use client";

import { PostHogProvider } from "./posthog-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <PostHogProvider>{children}</PostHogProvider>
    </ThemeProvider>
  );
}
