# Refactor Plan: Multi-Language, Modular, Secure

This document outlines a phased approach to clean up the project, improve security, and prepare for adding Python, C++, and other languages without major refactors.

---

## Current Architecture Summary

### Go-Specific (Needs Abstraction)
| Location | What |
|----------|------|
| `src/app/golang/[slug]/` | Route hardcoded to "golang" |
| `src/lib/tutorials.ts` | Single `content/` dir, no language param |
| `src/lib/tutorial-steps/` | All Go steps, flat structure |
| `src/lib/highlight-go.ts` | Go-only syntax highlighter |
| `src/app/api/run-code/route.ts` | Calls go.dev/_/compile only |
| `content/*.mdx` | All Go content, `\`\`\`gorun` blocks |
| Hardcoded `/golang/` in ~20+ files | Sidebar, nav, links, sitemap |

### Shared (Reusable)
- Auth, progress, bookmarks, achievements, plans
- InteractiveTutorial, CodePlayground, InstructionsSidebar
- API utils, rate limiting, CSRF
- DB schema (Neon/PostgreSQL)

---

## Phase 1: Language Registry (Core Abstraction)

Introduce a **language registry** so adding a new language is a single config + content drop.

### 1.1 Create `src/lib/languages/registry.ts`

```ts
export type SupportedLanguage = "go" | "python" | "cpp"; // extend as needed

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  slug: string;           // URL segment: "go", "python", "cpp"
  contentDir: string;     // "content/go", "content/python"
  defaultStarter: string;  // starter code for challenges
  runEndpoint: string;     // "/api/run-code" or per-lang endpoint
  highlighter: (code: string) => string;
  fileExtension: string;   // ".go", ".py", ".cpp"
}

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  go: {
    id: "go",
    name: "Go",
    slug: "go",
    contentDir: "content/go",
    defaultStarter: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// TODO\n}',
    runEndpoint: "/api/run-code",
    highlighter: highlightGo,
    fileExtension: ".go",
  },
  // python: { ... },
  // cpp: { ... },
};
```

### 1.2 Update `src/lib/tutorials.ts` to Accept Language

```ts
export function getAllTutorials(lang: SupportedLanguage): TutorialMeta[] {
  const config = LANGUAGES[lang];
  const contentDir = path.join(process.cwd(), config.contentDir);
  // ... rest uses contentDir
}
```

### 1.3 Move Content by Language

```
content/
  go/           # current content/*.mdx
    getting-started.mdx
    variables-and-types.mdx
    ...
  python/       # future
  cpp/          # future
```

### 1.4 Tutorial Steps Registry

```
src/lib/tutorial-steps/
  go/
    index.ts      # re-export allSteps
    getting-started.ts
    variables-and-types.ts
    ...
  python/
  cpp/
```

---

## Phase 2: Dynamic Routing

### 2.1 Route Structure

**Current:** `/golang/[slug]`  
**Target:** `/[lang]/[slug]` (e.g. `/go/getting-started`, `/python/variables`)

### 2.2 Create `src/app/[lang]/[slug]/page.tsx`

Single dynamic route that:
1. Validates `lang` against `LANGUAGES`
2. Loads tutorials for that language
3. Renders `InteractiveTutorial` with language-specific config

### 2.3 URL Helper

```ts
// src/lib/urls.ts
export function tutorialUrl(lang: SupportedLanguage, slug: string, step?: number): string {
  const base = `/${lang}/${slug}`;
  return step != null ? `${base}?step=${step}` : base;
}
```

Replace all hardcoded `/golang/` with `tutorialUrl("go", slug)`.

---

## Phase 3: Code Execution Abstraction

### 3.1 Run Code API

**Option A: Single endpoint with language param**
```ts
// POST /api/run-code { language: "go" | "python" | "cpp", code: string }
```

**Option B: Language-specific endpoints** (cleaner separation)
```
/api/run-code/go
/api/run-code/python   → Piston API or pyodide
/api/run-code/cpp       → Piston API
```

### 3.2 Execution Backends

| Language | Backend | Notes |
|----------|---------|-------|
| Go | go.dev/_/compile | Current, trusted |
| Python | Piston API (emkc.org) or Pyodide (WASM) | Piston = network, Pyodide = client |
| C++ | Piston API | Same as Python |

### 3.3 Syntax Highlighters

Create `src/lib/highlight/`:
```
highlight/
  go.ts
  python.ts
  cpp.ts
  index.ts   # getHighlighter(lang) => (code) => string
```

Use Shiki on server or keep lightweight client highlighters.

---

## Phase 4: Database Schema Updates

### 4.1 Add `language` to Progress, Bookmarks, etc.

```sql
-- progress: (user_id, tutorial_slug) → (user_id, language, tutorial_slug)
ALTER TABLE progress ADD COLUMN language TEXT DEFAULT 'go';
-- Migrate: UPDATE progress SET language = 'go';
CREATE UNIQUE INDEX ... ON progress(user_id, language, tutorial_slug);
```

Similar for `bookmarks`, `ratings`, `code_drafts`, `code_snapshots` if they reference tutorials.

### 4.2 Migration Strategy

- Add nullable `language` column, default `'go'`
- Backfill existing rows
- Add unique constraint
- Update application code to always pass `language`

---

## Phase 5: Security Hardening

### 5.1 CSRF on Missing Endpoints

Add `verifyCsrf` to state-changing APIs that use `apiFetch`:
- `/api/code-drafts` (POST, PUT)
- `/api/code-snapshots` (POST)
- `/api/chat` (POST)
- `/api/code-feedback` (POST)
- `/api/step-check` (POST)
- `/api/run-code` (POST) — optional, but recommended for consistency

### 5.2 Code Execution Security

- **Input limits:** Enforce max code length (e.g. 64KB) in run-code
- **Output limits:** Truncate long outputs to prevent DoS
- **Timeouts:** Ensure fetch to go.dev/Piston has a timeout
- **Allowlist:** Only allow known execution backends in CSP

### 5.3 Input Validation

- Add `zod` or similar for API request validation
- Sanitize user code before passing to AI (chat, code-feedback) — already partial
- Validate `slug` and `stepIndex` types and ranges

### 5.4 Secrets

- Ensure `JWT_SECRET`, `DATABASE_URL`, `ANTHROPIC_API_KEY` never in client
- Use Vercel env vars or similar
- Rotate secrets if exposed

---

## Phase 6: Modularity & Cleanup

### 6.1 Shared Paddle Type

Create `src/types/paddle.d.ts`:
```ts
declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: "sandbox" | "production") => void };
      Setup: (opts: { token: string; eventCallback?: (ev: unknown) => void }) => void;
      Checkout: {
        open: (opts: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, string>;
          customer?: { email?: string };
        }) => void;
      };
    };
  }
}
export {};
```

Remove duplicate `declare global` from `PlanTab.tsx` and `pricing/page.tsx`.

### 6.2 Centralize Constants

```ts
// src/lib/constants.ts
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://golang-tutorials.vercel.app";
export const APP_NAME = "uByte";
```

### 6.3 Config-Driven Metadata

Move "Learn Go for Free" / "uByte" strings into language config or a site config so adding Python doesn't require editing 20 files.

---

## Implementation Order

1. **Phase 6.1** — Fix Paddle type conflict (quick win)
2. **Phase 1.1–1.2** — Language registry + update tutorials.ts
3. **Phase 5.1** — Add CSRF to missing endpoints
4. **Phase 2** — Dynamic routing + URL helper
5. **Phase 1.3–1.4** — Move content, restructure steps
6. **Phase 3** — Code execution abstraction
7. **Phase 4** — DB migrations
8. **Phase 5.2–5.4** — Remaining security
9. **Phase 6.2–6.3** — Constants and config cleanup

---

## Adding a New Language (After Refactor)

1. Add `python` to `SupportedLanguage` and `LANGUAGES`
2. Create `content/python/*.mdx`
3. Create `src/lib/tutorial-steps/python/*.ts`
4. Add `src/lib/highlight/python.ts`
5. Implement `/api/run-code/python` (e.g. Piston)
6. Update `next.config` redirects if needed

No changes to:
- InteractiveTutorial, CodePlayground, Sidebar (they receive `lang` from context/route)
- Auth, progress, plans (they accept `language` param)
- API utils, rate limit, CSRF

---

## File Change Summary

| Change | Files |
|--------|-------|
| Add language registry | `src/lib/languages/registry.ts` |
| Update tutorials.ts | `src/lib/tutorials.ts` |
| Dynamic route | `src/app/[lang]/[slug]/page.tsx` (new), remove `golang/` |
| URL helper | `src/lib/urls.ts` |
| Replace `/golang/` | ~20 files (Sidebar, Nav, ContinueBanner, etc.) |
| Run-code abstraction | `src/app/api/run-code/route.ts` or new per-lang routes |
| Highlighter index | `src/lib/highlight/index.ts` |
| Paddle types | `src/types/paddle.d.ts`, remove from PlanTab + pricing |
| CSRF | 5–6 API routes |
| DB migration | `scripts/migrate-v2.sql` |
