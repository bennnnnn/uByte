# uByte — Gap analysis: scalability, UX, security, SEO

This document summarizes what the project currently lacks and what to add so the platform is **scalable** (all languages), **user-friendly**, **secure**, and **SEO-optimized** (e.g. "go variables", "python variables" show up in search).

---

## 1. Scalability (multi-language)

### Current state
- **Routing:** `[lang]/[slug]` supports `go`, `python`, `cpp`; `/golang/*` redirects to `/go/*`.
- **Content:** Only **Go** has content (`content/go/*.mdx`) and steps (`tutorial-steps/go`). Python and C++ have config in `lib/languages/registry.ts` but **no content** and **no steps** (`stepsByLanguage.python = {}`, `cpp = {}`).
- **DB/APIs:** Progress, bookmarks, ratings, drafts, snapshots, code-feedback all accept `lang` (default `"go"`). Migration adds `language` column.
- **Search:** `/api/search` only searches **Go** tutorials and steps.
- **Homepage:** Only shows Go; no language switcher or links to `/python`, `/cpp`.

### Gaps
| Gap | Impact | Recommendation |
|-----|--------|-----------------|
| Sitemap only includes Go | Python/C++ pages never get indexed | Include all languages in sitemap (when they have content) |
| robots.txt only allows `/go/` | Crawlers may not index `/python/`, `/cpp/` | Allow `/python/`, `/cpp/` (and keep disallow for /profile, /api) |
| No language landing pages | Users can’t discover Python/C++ | Add `/python`, `/cpp` pages (or `/[lang]`) that list that language’s tutorials |
| Search is Go-only | In-app search ignores other languages | Search all languages or pass `?lang=` and scope results |
| Homepage is Go-only | No path to “Learn Python” / “Learn C++” | Add language switcher or “Learn Go / Python / C++” cards on homepage |
| Run-code / code-feedback | Already support lang; Python/C++ need execution backends | When adding content, wire run-code for Python/C++ (e.g. external runner or sandbox) |

### Action list (scalability)
1. When adding Python/C++ content: add `content/python/*.mdx`, `content/cpp/*.mdx` and corresponding steps in `tutorial-steps/`.
2. Extend **sitemap** to include URLs for every language that has tutorials (e.g. `getAllLanguageSlugs()` + per-lang `getAllTutorials(lang)`).
3. Update **robots.ts**: `allow: ["/", "/go/", "/python/", "/cpp/"]` (or derive from language registry).
4. Add **language landing**: e.g. `/[lang]` page that shows tutorials for that language (and 404 for unsupported or empty lang).
5. **Search API**: accept optional `lang`; if absent, search all languages and return results with `lang` so the UI can link to `/python/variables` etc.
6. **Homepage**: add a small “Languages” section or tabs: “Go” (current), “Python”, “C++” linking to `/[lang]` or first tutorial.

---

## 2. SEO (e.g. “go variables”, “python variables” show up)

### Current state
- **Tutorial pages:** Good. Each `[lang]/[slug]` has `generateMetadata` (title, description, keywords, canonical, Open Graph, Twitter), and JSON-LD `TechArticle`.
- **Keywords:** Tutorial metadata includes things like `${tutorial.title}`, `${config.name} tutorial`, `learn ${config.name}`, etc. — so “Go variables” and “Python variables” can appear once Python has content and is in the sitemap.
- **Root layout:** Title/description/OG are **Go-only** (“Learn Go for Free”), which is correct while Go is the only content.
- **Sitemap:** Only Go tutorial URLs. So only Go lesson URLs are submitted to search engines.
- **robots.txt:** Allows `/` and `/go/`; does not explicitly allow `/python/` or `/cpp/`.

### Gaps
| Gap | Impact | Recommendation |
|-----|--------|-----------------|
| Sitemap is Go-only | Search engines don’t know about /python/*, /cpp/* | Add all language tutorial URLs to sitemap (see above) |
| robots.txt | /python/, /cpp/ not explicitly allowed | Allow all language paths (see above) |
| No language-specific homepage metadata | /python or /cpp landing could have generic metadata | When you add /[lang] landing, add generateMetadata with language-specific title/description/keywords |
| JSON-LD on tutorial uses `inLanguage: "en"` | Minor; could be per-lang | Set `inLanguage` from language (e.g. "en" for all for now) |
| Missing FAQ / HowTo schema | Rich results for “how to” queries | Optional: add FAQ or HowTo JSON-LD on key pages (e.g. homepage, language landing) |
| Canonical and OG per tutorial | Already good | Keep; ensure `tutorialCanonicalUrl` uses correct BASE_URL |

### Action list (SEO)
1. **Sitemap:** Include all languages’ tutorial URLs (and language landing URLs if you add them).
2. **robots.txt:** Allow `/go/`, `/python/`, `/cpp/` (or dynamic from registry).
3. When adding **/[lang]** landing: add `generateMetadata` with language-specific title, description, keywords (from `getLanguageConfig(lang).seo`).
4. Optional: add **BreadcrumbList** JSON-LD on tutorial pages (e.g. Home → Go → Variables).
5. Keep current **TechArticle** and **Course** JSON-LD; add **Course** per language when you have a language landing.

---

## 3. Security

### Current state
- **Headers:** `next.config.ts` sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP (script, style, font, connect, frame-src, etc.).
- **CSRF:** Cookie + header; verified on sensitive mutations (profile, progress, bookmarks, drafts, snapshots, ratings, notes, etc.).
- **Rate limiting:** Auth (login/signup), search, snapshots, bookmarks, etc. use `checkRateLimit`.
- **Auth:** JWT in httpOnly cookie; token version for “logout everywhere”; bcrypt for passwords; lockout after failed logins.
- **DB:** Parameterized queries (Neon); no raw SQL concatenation.
- **Code display:** `highlight-go` escapes HTML; tutorial-steps passthrough for python/cpp escapes `<`, `>`, `&`.

### Gaps
| Gap | Impact | Recommendation |
|-----|--------|-----------------|
| Some mutation APIs may not verify CSRF | Risk of CSRF on state-changing endpoints | Audit all POST/PUT/DELETE; ensure verifyCsrf where session is used |
| Input validation | Large payloads or malformed data could stress DB/APIs | Validate body shape and size (e.g. max length for code, bio, name); return 400 on invalid |
| Rate limit on code-feedback / run-code | Abuse could run up AI or execution costs | Add rate limit per IP or per user for /api/code-feedback and /api/run-code |
| No explicit security.txt | Standard place for security contact | Optional: add `/.well-known/security.txt` with Contact and Policy |

### Action list (security)
1. Audit all mutation routes for CSRF; add verifyCsrf where missing.
2. Add request body validation (e.g. Zod) and max lengths for code, bio, snippet, etc.
3. Rate limit `/api/code-feedback` and `/api/run-code` per IP (and optionally per user when logged in).
4. Optional: add `security.txt` for security researchers.

---

## 4. User-friendly UI

### Current state
- **Auth:** Persistent login (365-day session); modern auth modal; clear CTAs.
- **Pricing/checkout:** Clean pricing page; success redirect; indigo (purple) CTAs.
- **Tutorial UX:** Sidebar, step progress, code editor, run/check, AI feedback, bookmarks, snapshots, discussion.
- **Mobile:** Mobile nav, responsive layout.
- **Accessibility:** Some aria labels; focus styles; semantic HTML in places.

### Gaps
| Gap | Impact | Recommendation |
|-----|--------|-----------------|
| No global language switcher | Users on a tutorial can’t switch to Python/C++ easily | Add a language switcher in header/sidebar (e.g. Go | Python | C++) linking to /[lang] or first tutorial |
| Error states | Network or server errors may be generic | Use clear, friendly messages and retry where appropriate |
| Loading states | Some fetches have no skeleton/spinner | Ensure critical paths (profile, progress, tutorial) have loading/empty states |
| Keyboard/shortcuts | Power users may want shortcuts | You have ShortcutsModal; ensure it’s discoverable (e.g. “? ” in header) |
| Empty states for Python/C++ | Visiting /python with no content is confusing | Show “Coming soon” or “We’re building Python tutorials” on empty language landing |
| Consistency | Some pages still zinc-900 buttons | Use indigo (brand) for primary actions site-wide |

### Action list (UX)
1. Add **language switcher** (header or sidebar) once multiple languages have content.
2. Standardize **empty states** and **loading** for profile, search, and language landings.
3. Make **shortcuts** discoverable (e.g. “?” or “Keyboard shortcuts” in nav).
4. Use **indigo** consistently for primary CTAs across the app.

---

## 5. Quick wins (high impact, low effort)

1. **Sitemap:** Add all languages’ tutorial URLs (loop over `getAllLanguageSlugs()`, then `getAllTutorials(lang)` for each).
2. **robots.ts:** Extend `allow` to include `/python/` and `/cpp/` (or derive from registry).
3. **Search API:** Add optional `lang` query param; if present, search only that language; if absent, search Go for now (later: all languages with `lang` in each result).
4. **Rate limit:** Add rate limit to `/api/code-feedback` and `/api/run-code`.
5. **/[lang] route:** Add a minimal `app/[lang]/page.tsx` that lists tutorials for that language (or “Coming soon” if none), with language-specific metadata from registry — so `/python` and `/cpp` are valid, indexable URLs.
6. **Homepage:** Add a line like “Also coming: Python, C++” with links to `/python`, `/cpp` so crawlers and users see those URLs.

---

## 6. Summary table

| Area | Status | Priority |
|------|--------|----------|
| Multi-language routing & DB | Done (lang in APIs, migration) | — |
| Multi-language content | Only Go has content/steps | High when adding Python/C++ |
| Sitemap all languages | Go only | High for SEO |
| robots.txt all languages | Go only | High for SEO |
| Language landing /[lang] | Missing | High for scalability & SEO |
| Search all languages | Go only | Medium |
| Homepage language links | Go only | Medium |
| Security (CSRF, validation, rate limits) | Mostly good; a few gaps | Medium |
| UX (language switcher, empty/loading) | Partial | Medium |
| JSON-LD / schema | Good; optional Breadcrumb/FAQ | Low |

Implementing the **Quick wins** and **Sitemap + robots + /[lang]** will make the site ready for multi-language content and improve the chance that “go variables”, “python variables”, etc. show up in search once you add content and sitemap entries for each language.
