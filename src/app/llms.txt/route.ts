import { ALL_LANGUAGE_KEYS, PRACTICE_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { LANGUAGES } from "@/lib/languages/registry";
import { EXAM_LANGS } from "@/lib/exams/config";
import { BASE_URL, APP_NAME } from "@/lib/constants";

export function GET() {
  const allLangs = ALL_LANGUAGE_KEYS.map((k) => LANGUAGES[k]);
  const practiceLangs = PRACTICE_LANGUAGE_KEYS.map((k) => LANGUAGES[k]);
  const examLangs = EXAM_LANGS.map((k) => LANGUAGES[k]);

  const body = `# ${APP_NAME}

> ${APP_NAME} is a free interactive coding education platform. All tutorials, interview prep problems, and certification exams are free for every user. Pro plan unlocks AI-powered hints, AI code review, and interview simulator AI debrief. Supports ${allLangs.map((l) => l.name).join(", ")}.

## Site

- URL: ${BASE_URL}
- Sitemap: ${BASE_URL}/sitemap.xml
- Robots: ${BASE_URL}/robots.txt

## Tutorials (all free — 9 languages)

Step-by-step interactive tutorials with live code execution and instant feedback. All lessons free.

${allLangs.map((l) => `- [${l.name} Tutorials](${BASE_URL}/tutorial/${l.slug})`).join("\n")}

## Interview Prep (all free — ${practiceLangs.length} languages)

LeetCode-style coding challenges with automated test validation. All problems free for signed-in users.

${practiceLangs.map((l) => `- [${l.name} Practice](${BASE_URL}/practice/${l.slug})`).join("\n")}

## Certifications (free — ${examLangs.length} languages)

Timed certification exams with verifiable digital certificates. Free for everyone.

${examLangs.map((l) => `- [${l.name} Certification](${BASE_URL}/certifications/${l.slug})`).join("\n")}

## Pro Features (paid)

- AI hints when stuck on a tutorial step
- AI code review on every practice submission
- Interview simulator AI debrief

## Other

- [Daily Challenge](${BASE_URL}/daily) — free, no account required
- [Interview Simulator](${BASE_URL}/interview)
- [Interview Experiences](${BASE_URL}/interviews)
- [Leaderboard](${BASE_URL}/leaderboard)
- [Pricing](${BASE_URL}/pricing)
- [About](${BASE_URL}/about)
- [Contact](${BASE_URL}/contact)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
