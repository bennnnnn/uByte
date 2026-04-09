/**
 * Server-side "smart continue" + struggle hints for the home page.
 */
import { getLastActivity } from "@/lib/db/last-activity";
import {
  getLastTouchedTutorial,
  getSuggestedResumeStepIndex,
} from "@/lib/db/step-progress";
import { getUserStruggleHints } from "@/lib/db/user-step-attempts";
import { getAllTutorials } from "@/lib/tutorials";
import { getSteps } from "@/lib/tutorial-steps";
import { isSupportedLanguage, LANGUAGES } from "@/lib/languages/registry";
import { tutorialUrl } from "@/lib/urls";
import type { SupportedLanguage } from "@/lib/languages/types";

export interface HomeStruggleCard {
  href: string;
  langLabel: string;
  line1: string;
}

export interface HomeContinueResolved {
  leftOff: { href: string; label: string } | null;
  continueLang: SupportedLanguage;
  continueTutorialList: { slug: string; title: string }[];
  struggleCards: HomeStruggleCard[];
}

export async function resolveHomeContinue(userId: number): Promise<HomeContinueResolved> {
  const defaultLang: SupportedLanguage = "go";

  const build = (
    lang: string,
    slug: string,
    step: number | null
  ): Omit<HomeContinueResolved, "struggleCards"> | null => {
    if (!isSupportedLanguage(lang)) return null;
    const tutorials = getAllTutorials(lang);
    const meta = tutorials.find((t) => t.slug === slug);
    if (!meta) return null;
    const href = tutorialUrl(lang, slug, step != null ? step : undefined);
    const label = step != null ? `${meta.title} · Step ${step + 1}` : meta.title;
    return {
      leftOff: { href, label },
      continueLang: lang,
      continueTutorialList: tutorials.map(({ slug: s, title }) => ({ slug: s, title })),
    };
  };

  const last = await getLastActivity(userId);
  let base: Omit<HomeContinueResolved, "struggleCards"> | null = null;

  if (last?.activity_type === "tutorial" && last.slug) {
    base = build(last.lang, last.slug, last.step);
  }

  if (!base) {
    const touch = await getLastTouchedTutorial(userId);
    if (touch && isSupportedLanguage(touch.language)) {
      const steps = getSteps(touch.language, touch.tutorial_slug);
      if (steps.length > 0) {
        const resume = await getSuggestedResumeStepIndex(
          userId,
          touch.language,
          touch.tutorial_slug,
          steps.length
        );
        base = build(touch.language, touch.tutorial_slug, resume);
      }
    }
  }

  const hints = await getUserStruggleHints(userId, 5);
  const leftHref = base?.leftOff?.href ?? null;

  const struggleCards: HomeStruggleCard[] = [];
  for (const h of hints) {
    if (!isSupportedLanguage(h.language)) continue;
    const tutorials = getAllTutorials(h.language);
    const meta = tutorials.find((t) => t.slug === h.tutorial_slug);
    if (!meta) continue;
    const steps = getSteps(h.language, h.tutorial_slug);
    const st = steps[h.step_index];
    const href = tutorialUrl(h.language, h.tutorial_slug, h.step_index);
    if (href === leftHref) continue;
    struggleCards.push({
      href,
      langLabel: LANGUAGES[h.language]?.name ?? h.language,
      line1: `${meta.title} — ${st?.title ?? `Step ${h.step_index + 1}`}`,
    });
    if (struggleCards.length >= 3) break;
  }

  if (base) {
    return { ...base, struggleCards };
  }

  return {
    leftOff: null,
    continueLang: defaultLang,
    continueTutorialList: [],
    struggleCards,
  };
}
