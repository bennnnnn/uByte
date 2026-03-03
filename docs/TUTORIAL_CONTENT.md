# Tutorial content (concept + steps)

Tutorials are **concept-first, then coding**: short explanations in MDX, then one coding problem per concept so users learn by doing. The same structure is translatable to other languages.

---

## 1. Concept: `content/<lang>/<slug>.mdx`

- **Frontmatter** (SEO and UI): `title`, `description`, `order`, `difficulty`, `estimatedMinutes`.
- **Body**: Short concept sections with `##` headings. Start with a **"Concepts in this chapter"** list so users see what they’ll learn; then explain each concept; end with "What's next?".
- **No hardcoded lesson titles in code** — use `title` and `description` from frontmatter for meta, OG, and chat.

---

## 2. Steps: `content/<lang>/<slug>.steps.json`

When this file exists, the app loads steps from it instead of from TypeScript. Same slug as the MDX.

**Schema (array of step objects):**

| Field            | Type     | Required | Description                          |
|-----------------|----------|----------|--------------------------------------|
| `title`         | string   | yes      | Short step title (sidebar, chat)     |
| `instruction`   | string   | yes      | What the user must do                |
| `hint`          | string   | no       | Optional hint                        |
| `starter`       | string   | yes      | Starter code (escape newlines as `\n`) |
| `expectedOutput`| string[] | yes      | Lines the program should output      |

**Example** (`content/go/variables-and-types.steps.json`):

```json
[
  {
    "title": "Declare with var",
    "instruction": "Declare a string variable named name with value \"Alice\" and an int named age with value 30. Print both.",
    "hint": "var name string = \"Alice\"",
    "starter": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\t// TODO: ...\n}",
    "expectedOutput": ["Alice", "30"]
  }
]
```

- One step per concept (e.g. one for `int8`, one for `int16`) so each exercise is focused.
- **Translating to another language**: Copy the JSON to `content/python/<slug>.steps.json` (or other lang), translate `title`, `instruction`, `hint`, and replace `starter` and `expectedOutput` with that language’s code and output.

---

## 3. Fallback: TypeScript steps

If `<slug>.steps.json` is missing, the app uses steps from `src/lib/tutorial-steps/<lang>/<slug>.ts` (e.g. Go’s existing TS files). Add JSON under `content/` when you want data-driven, translatable steps.

---

## 4. SEO

- Page title and description come from the tutorial MDX frontmatter.
- Chat and notifications use the tutorial **title** from content (via `getTutorialBySlug`), not a slug-derived string.
- Use clear, keyword-friendly `title` and `description` in each chapter’s MDX.
