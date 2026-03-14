"use client";

/**
 * BlogTab — create, edit, and delete blog posts from the admin panel.
 *
 * Posts are stored in the database and merged with MDX files on the blog
 * page. DB posts take precedence when slugs match (useful for editing
 * pre-existing MDX content without touching the repo).
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api-client";
import { SectionCard } from "../components";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  read_time: string;
  author: string;
  published: boolean;
  og_image: string;
  created_at: string;
  updated_at: string;
}

const EMPTY: Omit<BlogPost, "id" | "created_at" | "updated_at"> = {
  slug: "",
  title: "",
  description: "",
  content: "",
  category: "General",
  tags: [],
  read_time: "5 min read",
  author: "uByte Team",
  published: true,
  og_image: "",
};

const CATEGORIES = ["General", "Interview Prep", "Learning Guide", "Language Deep Dive", "Comparison", "News"];

/**
 * Lightweight Markdown → HTML renderer (no external deps).
 * Handles: headings (h1–h3), bold, italic, inline code, fenced code blocks,
 * blockquotes, unordered/ordered lists, links, images, horizontal rules,
 * and paragraphs.
 */
function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let inUl = false;
  let inOl = false;

  function closeList() {
    if (inUl) { html.push("</ul>"); inUl = false; }
    if (inOl) { html.push("</ol>"); inOl = false; }
  }

  function esc(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s: string): string {
    return s
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${esc(alt)}" class="max-w-full rounded" />`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline dark:text-indigo-400">${text}</a>`)
      .replace(/`([^`]+)`/g, (_, c) => `<code class="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">${esc(c)}</code>`)
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>");
  }

  for (const raw of lines) {
    const line = raw;

    // Fenced code block
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        const langLabel = codeLang ? `<span class="text-zinc-400 text-[10px] font-mono">${esc(codeLang)}</span>` : "";
        html.push(
          `<div class="relative my-3 rounded-lg bg-zinc-900 dark:bg-zinc-950">` +
          `<div class="flex items-center justify-between px-3 pt-2 pb-1">${langLabel}</div>` +
          `<pre class="overflow-x-auto px-3 pb-3 text-xs text-zinc-100"><code>${esc(codeLines.join("\n"))}</code></pre></div>`
        );
        inCodeBlock = false;
        codeLang = "";
        codeLines = [];
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { closeList(); html.push('<hr class="my-4 border-zinc-200 dark:border-zinc-700" />'); continue; }

    // Headings
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) { closeList(); html.push(`<h1 class="mt-6 mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">${inline(h1[1])}</h1>`); continue; }
    if (h2) { closeList(); html.push(`<h2 class="mt-5 mb-1.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">${inline(h2[1])}</h2>`); continue; }
    if (h3) { closeList(); html.push(`<h3 class="mt-4 mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-200">${inline(h3[1])}</h3>`); continue; }

    // Blockquote
    if (line.startsWith("> ")) {
      closeList();
      html.push(`<blockquote class="my-2 border-l-4 border-indigo-300 pl-3 text-sm italic text-zinc-500 dark:border-indigo-700 dark:text-zinc-400">${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\*\-] (.+)/);
    if (ulMatch) {
      if (inOl) { html.push("</ol>"); inOl = false; }
      if (!inUl) { html.push('<ul class="my-2 list-disc space-y-0.5 pl-5 text-sm">'); inUl = true; }
      html.push(`<li>${inline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\. (.+)/);
    if (olMatch) {
      if (inUl) { html.push("</ul>"); inUl = false; }
      if (!inOl) { html.push('<ol class="my-2 list-decimal space-y-0.5 pl-5 text-sm">'); inOl = true; }
      html.push(`<li>${inline(olMatch[1])}</li>`);
      continue;
    }

    // Blank line — close lists, add paragraph break
    if (line.trim() === "") { closeList(); html.push('<div class="h-2" />'); continue; }

    // Regular paragraph line
    closeList();
    html.push(`<p class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">${inline(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

export default function BlogTab() {
  const [posts, setPosts]       = useState<BlogPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<BlogPost | null>(null);
  const [isNew, setIsNew]       = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);
  const [preview, setPreview]   = useState(false);
  const [tagInput, setTagInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json() as { posts: BlogPost[] };
        setPosts(data.posts);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setForm({ ...EMPTY });
    setTagInput("");
    setEditing(null);
    setIsNew(true);
    setPreview(false);
  }

  function openEdit(post: BlogPost) {
    setForm({
      slug:        post.slug,
      title:       post.title,
      description: post.description,
      content:     post.content,
      category:    post.category,
      tags:        post.tags,
      read_time:   post.read_time,
      author:      post.author,
      published:   post.published,
      og_image:    post.og_image ?? "",
    });
    setTagInput("");
    setEditing(post);
    setIsNew(false);
    setPreview(false);
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setMessage(null);
  }

  async function save() {
    if (!form.title.trim()) { setMessage({ text: "Title is required.", ok: false }); return; }
    setSaving(true);
    setMessage(null);
    try {
      const url    = isNew ? "/api/admin/blog" : `/api/admin/blog/${editing!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { post?: BlogPost; error?: string };
      if (!res.ok) { setMessage({ text: data.error ?? "Save failed.", ok: false }); return; }
      setMessage({ text: isNew ? "Post created!" : "Post saved!", ok: true });
      await load();
      if (isNew && data.post) {
        setEditing(data.post);
        setIsNew(false);
        setForm((f) => ({ ...f, slug: data.post!.slug }));
      }
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((p) => p.filter((x) => x.id !== post.id));
      if (editing?.id === post.id) closeEditor();
    }
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  const showEditor = isNew || editing !== null;
  const previewHtml = useMemo(() => renderMarkdown(form.content), [form.content]);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Blog posts</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            DB-backed posts. Merged with MDX files on the live blog; DB takes precedence on slug collision.
          </p>
        </div>
        {!showEditor && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            + New post
          </button>
        )}
      </div>

      {/* ── Editor ─────────────────────────────────────────────────────── */}
      {showEditor && (
        <SectionCard
          title={isNew ? "New post" : `Editing: ${editing?.title || "…"}`}
          description="Markdown supported in the content field. Use ## for headings, ``` for code blocks."
        >
          <div className="space-y-4">
            {/* Title + Slug row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug: isNew ? title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,80) : f.slug,
                    }));
                  }}
                  placeholder="Post title"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated-from-title"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description (SEO meta)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="One-sentence summary shown on the blog list and in search results."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
            </div>

            {/* Category + Read time + Author */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Read time</label>
                <input
                  type="text"
                  value={form.read_time}
                  onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))}
                  placeholder="5 min read"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="uByte Team"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-700">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <button type="button" onClick={addTag} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400">
                  Add
                </button>
              </div>
            </div>

            {/* OG Image */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Custom OG Image URL
                <span className="ml-1 font-normal text-zinc-400">(optional — leave blank to auto-generate from title)</span>
              </label>
              <input
                type="url"
                value={form.og_image}
                onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
                placeholder="https://yourdomain.com/images/post-cover.png"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
              {form.og_image && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.og_image} alt="OG preview" className="h-32 w-full rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>

            {/* Content editor with preview toggle */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Content (Markdown)</label>
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
              {preview ? (
                <div
                  className="min-h-[320px] rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={18}
                  placeholder="Write your post in Markdown. Use ## for headings, ```language for code blocks, **bold**, etc."
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
              )}
            </div>

            {/* Published toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Published (visible to readers)</span>
            </label>

            {/* Actions */}
            {message && (
              <p className={`text-sm font-medium ${message.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {message.text}
                {message.ok && editing && (
                  <> · <a href={`/blog/${editing.slug}`} target="_blank" rel="noopener noreferrer" className="underline">View post →</a></>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
              >
                {saving ? "Saving…" : isNew ? "Create post" : "Save changes"}
              </button>
              {editing && !form.published && editing.slug && (
                <a
                  href={`/blog/${editing.slug}?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  Preview draft →
                </a>
              )}
              {editing && form.published && editing.slug && (
                <a
                  href={`/blog/${editing.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-400"
                >
                  View live →
                </a>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={() => deletePost(editing)}
                  className="rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Post list ──────────────────────────────────────────────────── */}
      <SectionCard title={`DB posts (${posts.length})`} description="These are posts stored in the database. MDX files in content/blog/ are not listed here.">
        {loading ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No DB posts yet. Click "+ New post" to create one.</p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{post.title}</p>
                    {!post.published && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                    /blog/{post.slug} · {post.category} · {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePost(post)}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
