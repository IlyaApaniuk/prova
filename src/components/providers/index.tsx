"use client";

import { PostHogProvider } from "./posthog-provider";

// ThemeProvider (next-themes) returns together with the app UI —
// the landing stages its own light and must not depend on a theme.
export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}
