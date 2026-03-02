# uByte — Homepage, multi-language & interview practice plan

This doc is the **single source of truth** for:
- How the **homepage** will look with multiple languages and future interview practice.
- **Monaco Editor** adoption.
- **Execution backends** per language.
- **Interview practice** (LeetCode-style) as a product area.

---

## 1. Homepage structure (target)

### 1.1 Top-level sections

| Section | Purpose |
|--------|--------|
| **Hero** | One line: “Learn to code with uByte” (language-agnostic). Subtext: “Interactive lessons and interview practice in Go, Python, C++.” |
| **Learn a language** | Cards or tabs: **Go** · **Python** · **C++**. Each card: “Learn {Lang}” + short blurb + “Start” → `/{lang}` or first tutorial. |
| **Interview practice** (later) | Single card/link: “Practice interview problems” → `/practice` or `/interview`. LeetCode-style problems, multiple languages. |
| **How it works** | Keep current 4 tiles (Read, Code, Check, Earn XP). |
| **Continue learning** | Per-user: “Continue: Go – Variables” or “Continue: Python – Loops” (from progress). |
| **Footer / secondary** | “Go tutorials” · “Python tutorials” · “C++ tutorials” · “Interview practice” · Pricing · Privacy. |

### 1.2 URL and navigation

- **Home:** `/` — language-agnostic; shows all languages and “Interview practice”.
- **Language learning:** `/{lang}` (e.g. `/go`, `/python`, `/cpp`) — list of tutorials for that language; “Start” goes to `/{lang}/{first-slug}`.
- **Single tutorial:** `/{lang}/{slug}` — unchanged (e.g. `/go/variables-and-types`).
- **Interview practice:** `/practice` or `/interview` — list of problems; each problem: `/practice/{problemSlug}` with language picker (Go / Python / C++) and run/submit. *(Future.)*

### 1.3 Sidebar and global nav

- **Sidebar (tutorials):** When on `/{lang}/...`, sidebar shows only that language’s lessons (current behavior). Add a **language switcher** at top of sidebar or in header: “Go | Python | C++” → changes `lang` and keeps “learning” context (e.g. stay on same “topic” slug if it exists in the new lang, or go to `/{lang}`).
- **Header:** Logo (U + uByte) → `/`. No need to show “Learn Go” only; “Learn” or “Tutorials” can be a dropdown or link to `/` or `/go` by default.

### 1.4 What we don’t change yet

- **Pricing, profile, leaderboard, auth:** Unchanged.
- **Progress/XP:** Remain per-user; can be scoped per language later (e.g. “Go XP” vs “Python XP”) or stay global.

---

## 2. Monaco Editor

### 2.1 Why Monaco

- **Free (MIT),** same engine as VS Code.
- **Multi-language:** Go, Python, C++, and more out of the box (syntax, snippets, themes).
- **Familiar UX:** Autocomplete, minimap, line numbers, multi-cursor (optional), accessibility.

### 2.2 Where it’s used

- **Tutorial pages:** Replace the current `<textarea>` + custom highlight in `InteractiveTutorial` with a Monaco instance (one editor per “code” panel).
- **Interview practice (later):** Same — one Monaco editor per problem, with language selected (Go / Python / C++).
- **Code playground (if any):** Same.

### 2.3 Implementation approach

1. **Package:** `monaco-editor` (and optionally `@monaco-editor/react` for React).
2. **Lazy load:** Dynamic-import Monaco only on tutorial (and later practice) pages so the homepage stays light.
3. **Language id:** Map our `lang` to Monaco’s language id: `go` → `go`, `python` → `python`, `cpp` → `cpp`.
4. **Theme:** Match current light/dark (e.g. `vs` / `vs-dark` or custom to match Tailwind zinc/indigo).
5. **Run/Check:** Keep current “Run” and “Check” buttons; they still call `/api/run-code` (and later submit endpoint for practice). No change to execution flow, only the editor component.

### 2.4 Migration from current editor

- **Current:** `useCodeEditor` + `<textarea>` + custom `highlightGo` in `InteractiveTutorial`.
- **Target:** New component e.g. `MonacoCodeEditor` that:
  - Accepts `value`, `onChange`, `language`, `theme` (light/dark), `readOnly?`, `height`.
  - Uses Monaco under the hood; no custom syntax highlighter for the editor (Monaco does it).
- **Steps:** (1) Add Monaco + wrapper. (2) Swap the tutorial page to use the wrapper. (3) Remove old textarea + highlight code for the editor (keep highlight for any “static” code blocks elsewhere if needed).

---

## 3. Execution backends (run code)

| Language | Current | Target |
|----------|--------|--------|
| **Go** | `go.dev/_/compile` (Google) | Keep as-is. |
| **Python** | 501 “coming soon” | Use **Judge0** or **JDoodle** (managed API; no self-host). |
| **C++** | 501 “coming soon” | Same Judge0/JDoodle. |

- **API:** Keep single `POST /api/run-code` with `{ code, language }`. Inside the route: if `language === "go"` → call Go backend; if `python` / `cpp` → call Judge0/JDoodle with the right language id.
- **Security:** No self-hosted execution; Judge0/JDoodle handle sandboxing and limits. We only proxy (and apply our own rate limits and size limits).

---

## 4. Interview practice (LeetCode-style) — later phase

### 4.1 Product idea

- **List:** `/practice` — problems (e.g. “Two Sum”, “Valid Parentheses”) with difficulty (Easy/Medium/Hard), tags (Array, String, etc.).
- **Problem page:** `/practice/[slug]` — statement, examples, “Run” and “Submit”; language picker (Go / Python / C++); Monaco editor; output and “Accepted / Wrong answer” feedback.
- **No contest timer** at first; focus on “solve and run/submit” like LeetCode.

### 4.2 What we need later

- **Content:** Problem definitions (statement, examples, test cases, expected outputs). Stored in DB or markdown/JSON.
- **Execution:** Same `/api/run-code` for “Run”; new endpoint e.g. `POST /api/practice/submit` that runs against hidden tests and returns Accept/Wrong Answer (and maybe hints).
- **Progress:** Track “solved” per user per problem (and optionally per language).
- **Monaco:** Same editor as tutorials; language chosen by user.

### 4.3 Homepage placement

- One clear entry: **“Interview practice”** card or nav item → `/practice`. No need to duplicate on homepage beyond that.

---

## 5. Phased rollout (recommended)

| Phase | What |
|-------|------|
| **Phase 1 — Plan & homepage** | Implement new **homepage** layout: hero (language-agnostic), “Learn a language” (Go, Python, C++), “Interview practice” as a “Coming soon” link to `/practice` (static or 404). No Monaco yet. |
| **Phase 2 — Monaco** | Introduce **Monaco** on tutorial page(s); replace textarea for Go. Keep run-code and check logic. |
| **Phase 3 — Python (and C++)** | Add **Python** (and optionally C++) content (MDX + steps); wire **Judge0/JDoodle** in `/api/run-code` for `python` and `cpp`; enable `/[lang]` and sidebar for those languages. |
| **Phase 4 — Interview practice** | Add **/practice** and **/practice/[slug]**; problem data; Run + Submit with same run-code + new submit endpoint; Monaco + language picker. |

You can do Phase 1 first (homepage + clear “Learn Go / Python / C++” and “Interview practice” coming soon), then Phase 2 (Monaco), then Phase 3 (Python/C++ content and execution), then Phase 4 (interview practice).

---

## 6. Summary

- **Homepage:** One hero + “Learn a language” (Go / Python / C++) + “Interview practice” (later) + How it works + Continue learning.
- **Monaco:** Free (MIT); use for all code editing (tutorials + later practice); lazy-loaded; same Run/Check flow.
- **Languages:** Go (current backend); Python & C++ via Judge0 or JDoodle (no self-host).
- **Interview practice:** Separate section `/practice` and `/practice/[slug]`; same editor and execution backends; submit endpoint and problem data added later.

This plan keeps the current product intact, makes the homepage ready for multiple languages and interview practice, and sets a clear path for Monaco and execution without self-hosting.
