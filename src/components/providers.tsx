"use client";

import { PostHogProvider } from "@/lib/posthog/provider";
import { ThemeProvider } from "@/components/theme-provider";

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
