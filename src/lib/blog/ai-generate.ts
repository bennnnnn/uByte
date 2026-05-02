import { z } from "zod";
import { nanoid } from "nanoid";
import { callGateway } from "@/lib/ai/gateway-client";
import { createDbBlogPost } from "@/lib/db/blog-posts";
import { siteOrigin } from "@/lib/seo";

const CATEGORIES = ["Learning Guide", "Language Deep Dive", "Comparison"] as const;

const blogAiOutputSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(40).max(320),
  category: z.string().min(1),
  tags: z.array(z.string()).min(2).max(10),
  content: z.string().min(500),
});

export type BlogAiGenerateResult =
  | { ok: true; slug: string; title: string }
  | { ok: false; error: string; topic?: string };

function slugifyTitle(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return s || nanoid(10);
}

function normalizeCategory(raw: string): (typeof CATEGORIES)[number] {
  const t = raw.trim();
  const hit = CATEGORIES.find((c) => c.toLowerCase() === t.toLowerCase());
  return hit ?? "Learning Guide";
}

function stripJsonFence(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
}

function readTimeFromContent(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(3, Math.round(words / 200));
  return `${mins} min read`;
}

function ensureUniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  if (!taken.has(slug)) return slug;
  slug = `${base}-${nanoid(5).toLowerCase()}`;
  while (taken.has(slug)) {
    slug = `${base}-${nanoid(5).toLowerCase()}`;
  }
  return slug;
}

/**
 * Calls the configured AI gateway and inserts one DB blog post.
 * Content must be GitHub-flavored Markdown (headings, fenced code blocks with language tags).
 */
export async function generateAndInsertAiBlogPost(
  topicBrief: string,
  takenSlugs: Set<string>
): Promise<BlogAiGenerateResult> {
  const origin = siteOrigin();
  const model = process.env.BLOG_AI_MODEL?.trim() || "gemini-2.5-flash";
  const author = process.env.BLOG_AI_AUTHOR?.trim() || "uByte AI";

  const system = `You are the lead technical writer for uByte (uByte.dev), an interactive programming tutorial site.
Write ONE original, accurate, educational blog article. Tone: clear, friendly, expert — no hype, no "revolutionary", no unfounded claims.
Output rules (strict):
- Respond with a single JSON object wrapped in triple-backtick json fences, with no prose before or after.
- Keys: "title", "description", "category", "tags", "content".
- "category" must be exactly one of: "Learning Guide", "Language Deep Dive", "Comparison".
- "tags": 3–8 short tags; include the primary language name when relevant (e.g. "Go", "Python", "Rust", "TypeScript", "Java", "C++", "C#", "SQL", "JavaScript").
- "description": 1–2 sentences, meta-description style, no quotes around the whole string.
- "content": GitHub-flavored Markdown only. Use ## and ### headings. Include at least one fenced code block with a language tag on the opening fence (e.g. go or python). No HTML. No frontmatter.
- Naturally link to uByte tutorials where relevant using absolute URLs, e.g. [Go tutorials](${origin}/tutorial/go). Do not invent slugs; language hub links like ${origin}/tutorial/{lang} are always valid.
- Do not claim uByte features that do not exist. Tutorials are interactive in the browser; optional paid hints exist — mention only if relevant and brief.
- Minimum ~900 words of substance in "content".`;

  const user = `Article focus (use as the core theme; you may narrow scope):\n${topicBrief}`;

  let raw: string;
  try {
    raw = await callGateway({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      maxTokens: 8192,
      temperature: 0.42,
      timeoutMs: 180_000,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `AI call failed: ${msg}`, topic: topicBrief };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFence(raw));
  } catch {
    return { ok: false, error: "AI returned non-JSON output", topic: topicBrief };
  }

  const parsed = blogAiOutputSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { ok: false, error: `Invalid AI JSON: ${parsed.error.message}`, topic: topicBrief };
  }

  const data = parsed.data;
  const category = normalizeCategory(data.category);
  const tags = [...new Set(data.tags.map((t) => t.trim()).filter(Boolean))].slice(0, 10);
  if (tags.length < 2) {
    return { ok: false, error: "Too few tags after normalization", topic: topicBrief };
  }

  const read_time = readTimeFromContent(data.content);
  const baseSlug = slugifyTitle(data.title);
  const slug = ensureUniqueSlug(baseSlug, takenSlugs);
  takenSlugs.add(slug);

  const published =
    process.env.BLOG_AI_PUBLISHED !== "false" && process.env.BLOG_AI_PUBLISHED !== "0";

  try {
    await createDbBlogPost({
      slug,
      title: data.title.trim(),
      description: data.description.trim(),
      content: data.content.trim(),
      category,
      tags,
      read_time,
      author,
      published,
      og_image: "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    takenSlugs.delete(slug);
    return { ok: false, error: `DB insert failed: ${msg}`, topic: topicBrief };
  }

  return { ok: true, slug, title: data.title.trim() };
}
