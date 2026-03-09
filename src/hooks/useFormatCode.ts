"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

export function useFormatCode() {
  const [formatting, setFormatting] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);

  /**
   * Format code via the server-side /api/format-code route.
   * Returns the formatted code (unchanged if the formatter had no effect or errored).
   */
  const format = useCallback(async (code: string, language: string): Promise<string> => {
    if (!code.trim()) return code;
    setFormatting(true);
    setFormatError(null);
    try {
      const res = await apiFetch("/api/format-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      if (!res.ok) return code;
      const data = await res.json();
      return typeof data?.code === "string" ? data.code : code;
    } catch {
      setFormatError("Format failed");
      return code;
    } finally {
      setFormatting(false);
    }
  }, []);

  return { format, formatting, formatError };
}
