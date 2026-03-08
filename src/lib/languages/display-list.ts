import { LANGUAGES, ALL_LANGUAGE_KEYS } from "./registry";
import type { SupportedLanguage } from "./types";

/** Full language list for UI, derived from the registry. Client-safe. */
export const LANGUAGE_DISPLAY_LIST: { id: SupportedLanguage; name: string; slug: string }[] =
  ALL_LANGUAGE_KEYS.map((id) => ({
    id,
    name: LANGUAGES[id].name,
    slug: LANGUAGES[id].slug,
  }));
