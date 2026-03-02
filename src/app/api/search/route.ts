import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllStepsForLanguage } from "@/lib/tutorial-steps";
import { getAllLanguageSlugs, isSupportedLanguage } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

interface SearchResult {
  slug: string;
  title: string;
  matchType: "tutorial" | "step";
  stepIndex?: number;
  stepTitle?: string;
  excerpt: string;
  lang: string;
}

function excerpt(text: string, query: string, maxLen = 100): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen);
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 70);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

function searchLanguage(
  lang: SupportedLanguage,
  lower: string,
  q: string
): (SearchResult & { score: number })[] {
  const results: (SearchResult & { score: number })[] = [];
  const tutorials = getAllTutorials(lang);
  const stepsBySlug = getAllStepsForLanguage(lang);

  for (const t of tutorials) {
    const titleLower = t.title.toLowerCase();
    const descLower = t.description.toLowerCase();

    if (titleLower === lower) {
      results.push({ slug: t.slug, title: t.title, matchType: "tutorial", excerpt: t.description, lang, score: 100 });
    } else if (titleLower.includes(lower)) {
      results.push({ slug: t.slug, title: t.title, matchType: "tutorial", excerpt: t.description, lang, score: 80 });
    } else if (descLower.includes(lower)) {
      results.push({ slug: t.slug, title: t.title, matchType: "tutorial", excerpt: excerpt(t.description, q), lang, score: 60 });
    }

    const steps = stepsBySlug[t.slug] ?? [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepTitleLower = step.title.toLowerCase();
      const instrLower = step.instruction.toLowerCase();

      if (stepTitleLower.includes(lower)) {
        results.push({
          slug: t.slug,
          title: t.title,
          matchType: "step",
          stepIndex: i,
          stepTitle: step.title,
          excerpt: excerpt(step.instruction, q),
          lang,
          score: 50,
        });
      } else if (instrLower.includes(lower)) {
        results.push({
          slug: t.slug,
          title: t.title,
          matchType: "step",
          stepIndex: i,
          stepTitle: step.title,
          excerpt: excerpt(step.instruction, q),
          lang,
          score: 30,
        });
      }
    }
  }
  return results;
}

export const GET = withErrorHandling("GET /api/search", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`search:${ip}`, 20, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const langParam = searchParams.get("lang")?.trim();
  const lower = q.toLowerCase();
  let results: (SearchResult & { score: number })[] = [];

  if (langParam && isSupportedLanguage(langParam)) {
    results = searchLanguage(langParam as SupportedLanguage, lower, q);
  } else {
    for (const lang of getAllLanguageSlugs()) {
      if (isSupportedLanguage(lang)) {
        results.push(...searchLanguage(lang as SupportedLanguage, lower, q));
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  const final = results.slice(0, 20).map(({ score: _s, ...r }) => r);
  return NextResponse.json({ results: final });
});
