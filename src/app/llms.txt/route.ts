import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { LANGUAGES } from "@/lib/languages/registry";
import { BASE_URL, APP_NAME } from "@/lib/constants";

export function GET() {
  const langs = ALL_LANGUAGE_KEYS.map((k) => LANGUAGES[k]);

  const body = `# ${APP_NAME}

> ${APP_NAME} is a free, interactive coding education platform offering step-by-step tutorials, LeetCode-style practice problems, AI-powered hints, timed mock interviews, and verifiable certifications for ${langs.map((l) => l.name).join(", ")}.

## Site

- URL: ${BASE_URL}
- Sitemap: ${BASE_URL}/sitemap.xml
- Robots: ${BASE_URL}/robots.txt

## Tutorials

Interactive, in-browser tutorials with live code execution and instant feedback.

${langs.map((l) => `- [${l.name} Tutorials](${BASE_URL}/tutorial/${l.slug})`).join("\n")}

## Practice Problems

LeetCode-style coding challenges with automated test validation.

${langs.map((l) => `- [${l.name} Practice](${BASE_URL}/practice/${l.slug})`).join("\n")}

## Certifications

Timed certification exams with verifiable digital certificates.

${langs.map((l) => `- [${l.name} Certification](${BASE_URL}/certifications/${l.slug})`).join("\n")}

## Other

- [Daily Challenge](${BASE_URL}/daily)
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
