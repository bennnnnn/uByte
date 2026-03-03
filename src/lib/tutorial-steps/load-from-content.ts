import fs from "fs";
import path from "path";
import { getLanguageConfig } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { TutorialStep } from "./types";

/**
 * Load tutorial steps from content/<lang>/<slug>.steps.json when present.
 * Enables data-driven, translatable steps (no hardcoded strings in code).
 * Falls back to TS-defined steps when file is missing.
 */
export function loadStepsFromContent(
  lang: SupportedLanguage,
  slug: string
): TutorialStep[] | null {
  const config = getLanguageConfig(lang);
  if (!config?.contentDir) return null;

  const contentDir = path.join(process.cwd(), config.contentDir);
  const stepsPath = path.join(contentDir, `${slug}.steps.json`);
  if (!fs.existsSync(stepsPath)) return null;

  try {
    const raw = fs.readFileSync(stepsPath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return null;

    const steps: TutorialStep[] = data.map((item: Record<string, unknown>) => ({
      title: typeof item.title === "string" ? item.title : "",
      instruction: typeof item.instruction === "string" ? item.instruction : "",
      hint: typeof item.hint === "string" ? item.hint : undefined,
      starter: typeof item.starter === "string" ? item.starter : "",
      expectedOutput: Array.isArray(item.expectedOutput)
        ? (item.expectedOutput as string[])
        : [],
    }));

    return steps.length > 0 ? steps : null;
  } catch {
    return null;
  }
}
