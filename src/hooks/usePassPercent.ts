"use client";

import { useEffect, useState } from "react";

/**
 * Fetches the configured pass-percent for a given language from site settings.
 * Falls back to 70% if the fetch fails or the lang has no override.
 */
export function usePassPercent(lang: string) {
  const [passPercent, setPassPercent] = useState(70);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.passPercentByLang?.[lang]) setPassPercent(d.passPercentByLang[lang]);
      })
      .catch(() => {});
  }, [lang]);

  return passPercent;
}
