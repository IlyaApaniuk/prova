import { describe, expect, it } from "vitest";
import { sanitizeNextPath } from "./next-path";

const ORIGIN = "http://localhost:3000";

describe("sanitizeNextPath", () => {
  it("keeps relative paths, including query and hash", () => {
    expect(sanitizeNextPath("/en/jobs/some-role?ref=x#task", ORIGIN)).toBe(
      "/en/jobs/some-role?ref=x#task",
    );
  });

  it("converts same-origin absolute URLs to a path", () => {
    expect(sanitizeNextPath(`${ORIGIN}/en/jobs?page=2`, ORIGIN)).toBe(
      "/en/jobs?page=2",
    );
  });

  it("rejects foreign origins", () => {
    expect(sanitizeNextPath("https://evil.com/phish", ORIGIN)).toBe("/");
  });

  it("rejects protocol-relative and backslash tricks", () => {
    expect(sanitizeNextPath("//evil.com", ORIGIN)).toBe("/");
    expect(sanitizeNextPath("/\\evil.com", ORIGIN)).toBe("/");
  });

  it("falls back to / for empty or garbage input", () => {
    expect(sanitizeNextPath(null, ORIGIN)).toBe("/");
    expect(sanitizeNextPath("", ORIGIN)).toBe("/");
    expect(sanitizeNextPath("not a url", ORIGIN)).toBe("/");
  });
});
