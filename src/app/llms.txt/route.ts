import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { LANGUAGES } from "@/lib/languages/registry";
import { BASE_URL, APP_NAME } from "@/lib/constants";

export function GET() {
  const allLangs = ALL_LANGUAGE_KEYS.map((k) => LANGUAGES[k]);

  const body = `# ${APP_NAME}

> ${APP_NAME} is a free interactive coding tutorial platform. Every lesson is free — no paywalls, no subscriptions. Supports ${allLangs.map((l) => l.name).join(", ")}.

## Site

- URL: ${BASE_URL}
- Sitemap: ${BASE_URL}/sitemap.xml
- Robots: ${BASE_URL}/robots.txt

## Tutorials (all free — 9 languages)

Step-by-step interactive tutorials with live code execution and instant feedback. All lessons are free.

${allLangs.map((l) => `- [${l.name} Tutorials](${BASE_URL}/tutorial/${l.slug})`).join("\n")}

## Other

- [Leaderboard](${BASE_URL}/leaderboard)
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
