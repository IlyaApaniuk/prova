import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Middle Interior Designer")).toBe(
      "middle-interior-designer",
    );
  });

  it("strips diacritics", () => {
    expect(slugify("Projektant wnętrz — biuro")).toBe(
      "projektant-wnetrz-biuro",
    );
  });

  it("falls back for non-Latin titles", () => {
    expect(slugify("Дизайнер интерьеров")).toBe("role");
  });
});
