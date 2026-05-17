import { describe, it, expect } from "vitest";
import { TUTORIAL_LANG_IDS } from "@/lib/languages/tutorial-lang-ids";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

describe("tutorial language registry sync", () => {
  it("TUTORIAL_LANG_IDS matches LANGUAGES keys", () => {
    const fromRegistry = [...ALL_LANGUAGE_KEYS].sort();
    const fromIds = [...TUTORIAL_LANG_IDS].sort();
    expect(fromIds).toEqual(fromRegistry);
  });

  it("every id is a valid SupportedLanguage", () => {
    const allowed = new Set<SupportedLanguage>(ALL_LANGUAGE_KEYS);
    for (const id of TUTORIAL_LANG_IDS) {
      expect(allowed.has(id)).toBe(true);
    }
  });
});
