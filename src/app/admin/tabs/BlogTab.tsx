"use client";

/**
 * BlogTab — full-featured markdown blog editor for the admin panel.
 *
 * Features:
 *  • Formatting toolbar (H2/H3, Bold, Italic, Code, Link, Image, Quote,
 *    UL, OL, HR, Table, Code Block with language picker)
 *  • Three view modes: Write | Split (side-by-side) | Preview
 *  • Keyboard shortcuts: Ctrl+B bold, Ctrl+I italic, Ctrl+K link,
 *    Ctrl+` inline code, Tab inserts 2 spaces (no focus loss)
 *  • Live markdown preview with syntax-highlighted code blocks,
 *    tables, blockquotes, lists, and inline formatting
 *  • Auto read-time estimate based on content word count
 *  • Auto slug generation from title
 */

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { apiFetch } from "@/lib/api-client";
import { SectionCard } from "../components";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  slug: "", title: "", description: "", content: "",
  category: "General", tags: [], read_time: "5 min read",
  author: "uByte Team", published: true, og_image: "",
};

const CATEGORIES = ["General", "Interview Prep", "Learning Guide", "Language Deep Dive", "Comparison", "Python", "JavaScript", "Go", "Java", "Rust", "C++", "C#", "News"];
const CODE_LANGUAGES = ["python", "javascript", "typescript", "go", "java", "rust", "cpp", "csharp", "bash", "sql", "json", "html", "css", "plaintext"];

// ─── Markdown renderer (preview) ──────────────────────────────────────────────

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let inUl = false;
  let inOl = false;
  let tableLines: string[] = [];
  let inTable = false;

  function closeList() {
    if (inUl) { html.push("</ul>"); inUl = false; }
    if (inOl) { html.push("</ol>"); inOl = false; }
  }

  function flushTable() {
    if (!inTable || tableLines.length < 2) { tableLines = []; inTable = false; return; }
    const rows = tableLines.map((row) =>
      row.split("|").map((c) => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1)
    );
    const isSep = (r: string[]) => r.every((c) => /^[-: ]+$/.test(c));
    const headerIdx = rows.findIndex((_, i, a) => i > 0 && isSep(a[i]));
    const head = headerIdx > 0 ? rows.slice(0, headerIdx) : [rows[0]];
    const body = headerIdx > 0 ? rows.slice(headerIdx + 1) : rows.slice(1);
    html.push('<div class="overflow-x-auto my-4"><table class="min-w-full text-sm border-collapse">');
    html.push("<thead>");
    head.forEach((r) => {
      html.push('<tr class="border-b border-zinc-200 dark:border-zinc-700">');
      r.forEach((c) => html.push(`<th class="px-3 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800">${inline(c)}</th>`));
      html.push("</tr>");
    });
    html.push("</thead><tbody>");
    body.forEach((r, ri) => {
      html.push(`<tr class="${ri % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800/60"} border-b border-zinc-100 dark:border-zinc-800">`);
      r.forEach((c) => html.push(`<td class="px-3 py-2 text-zinc-700 dark:text-zinc-300">${inline(c)}</td>`));
      html.push("</tr>");
    });
    html.push("</tbody></table></div>");
    tableLines = []; inTable = false;
  }

  function esc(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s: string): string {
    return s
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
        `<img src="${src}" alt="${esc(alt)}" class="max-w-full rounded my-2" />`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline dark:text-indigo-400">${text}</a>`)
      .replace(/`([^`]+)`/g, (_, c) =>
        `<code class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.8em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">${esc(c)}</code>`)
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>");
  }

  for (const raw of lines) {
    // Fenced code block
    if (raw.startsWith("```")) {
      if (!inCodeBlock) {
        closeList(); flushTable();
        inCodeBlock = true;
        codeLang = raw.slice(3).trim();
        codeLines = [];
      } else {
        const label = codeLang
          ? `<div class="flex items-center justify-between px-4 py-1.5 bg-zinc-700 rounded-t-lg"><span class="font-mono text-[11px] text-zinc-300">${esc(codeLang)}</span><span class="text-[10px] text-zinc-500 uppercase tracking-wider">code</span></div>`
          : "";
        html.push(
          `<div class="my-4 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">${label}` +
          `<pre class="overflow-x-auto px-4 py-3 text-sm leading-relaxed"><code class="font-mono text-zinc-100">${esc(codeLines.join("\n"))}</code></pre></div>`
        );
        inCodeBlock = false; codeLang = ""; codeLines = [];
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(raw); continue; }

    // Table rows
    if (raw.trim().startsWith("|") && raw.trim().endsWith("|")) {
      closeList();
      inTable = true;
      tableLines.push(raw.trim());
      continue;
    }
    if (inTable) flushTable();

    // HR
    if (/^---+$/.test(raw.trim())) {
      closeList();
      html.push('<hr class="my-6 border-zinc-200 dark:border-zinc-700" />');
      continue;
    }

    // Headings
    const h1 = raw.match(/^# (.+)/);
    const h2 = raw.match(/^## (.+)/);
    const h3 = raw.match(/^### (.+)/);
    const h4 = raw.match(/^#### (.+)/);
    if (h1) { closeList(); html.push(`<h1 class="mt-6 mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">${inline(h1[1])}</h1>`); continue; }
    if (h2) { closeList(); html.push(`<h2 class="mt-6 mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">${inline(h2[1])}</h2>`); continue; }
    if (h3) { closeList(); html.push(`<h3 class="mt-4 mb-1.5 text-lg font-semibold text-zinc-800 dark:text-zinc-200">${inline(h3[1])}</h3>`); continue; }
    if (h4) { closeList(); html.push(`<h4 class="mt-3 mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-200">${inline(h4[1])}</h4>`); continue; }

    // Blockquote
    if (raw.startsWith("> ")) {
      closeList();
      html.push(`<blockquote class="my-3 border-l-4 border-indigo-400 bg-indigo-50 pl-4 pr-3 py-2 text-sm italic text-zinc-600 rounded-r dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-zinc-400">${inline(raw.slice(2))}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = raw.match(/^[\*\-] (.+)/);
    if (ulMatch) {
      if (inOl) { html.push("</ol>"); inOl = false; }
      if (!inUl) { html.push('<ul class="my-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">'); inUl = true; }
      html.push(`<li>${inline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = raw.match(/^\d+\. (.+)/);
    if (olMatch) {
      if (inUl) { html.push("</ul>"); inUl = false; }
      if (!inOl) { html.push('<ol class="my-2 list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">'); inOl = true; }
      html.push(`<li>${inline(olMatch[1])}</li>`);
      continue;
    }

    // Blank line
    if (raw.trim() === "") { closeList(); html.push('<div class="h-3" />'); continue; }

    // Paragraph
    closeList();
    html.push(`<p class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 my-1">${inline(raw)}</p>`);
  }

  closeList(); flushTable();
  return html.join("\n");
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarBtn {
  title: string;
  icon: React.ReactNode;
  action: string;
  className?: string;
}

function ToolbarButton({ title, icon, onClick, active }: {
  title: string; icon: React.ReactNode; onClick: () => void; active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors
        ${active
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        }`}
    >
      {icon}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function BlogTab() {
  const [posts, setPosts]         = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<BlogPost | null>(null);
  const [isNew, setIsNew]         = useState(false);
  const [form, setForm]           = useState({ ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState<{ text: string; ok: boolean } | null>(null);
  const [viewMode, setViewMode]   = useState<"write" | "split" | "preview">("write");
  const [tagInput, setTagInput]   = useState("");
  const [langPicker, setLangPicker] = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const langPickerRef             = useRef<HTMLDivElement>(null);

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

  // Close lang picker on outside click
  useEffect(() => {
    if (!langPicker) return;
    const handler = (e: MouseEvent) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) {
        setLangPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langPicker]);

  // Auto read-time from word count
  useEffect(() => {
    const words = form.content.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    setForm((f) => ({ ...f, read_time: `${mins} min read` }));
  }, [form.content]);

  function openNew() {
    setForm({ ...EMPTY }); setTagInput(""); setEditing(null); setIsNew(true); setViewMode("write");
  }

  function openEdit(post: BlogPost) {
    setForm({
      slug: post.slug, title: post.title, description: post.description,
      content: post.content, category: post.category, tags: post.tags,
      read_time: post.read_time, author: post.author, published: post.published,
      og_image: post.og_image ?? "",
    });
    setTagInput(""); setEditing(post); setIsNew(false); setViewMode("write");
  }

  function closeEditor() { setEditing(null); setIsNew(false); setMessage(null); }

  async function save() {
    if (!form.title.trim()) { setMessage({ text: "Title is required.", ok: false }); return; }
    setSaving(true); setMessage(null);
    try {
      const url    = isNew ? "/api/admin/blog" : `/api/admin/blog/${editing!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res  = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json() as { post?: BlogPost; error?: string };
      if (!res.ok) { setMessage({ text: data.error ?? "Save failed.", ok: false }); return; }
      setMessage({ text: isNew ? "Post created!" : "Post saved!", ok: true });
      await load();
      if (isNew && data.post) { setEditing(data.post); setIsNew(false); setForm((f) => ({ ...f, slug: data.post!.slug })); }
    } finally { setSaving(false); }
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    if (res.ok) { setPosts((p) => p.filter((x) => x.id !== post.id)); if (editing?.id === post.id) closeEditor(); }
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  }

  // ── Toolbar insertion ────────────────────────────────────────────────────────

  function insert(
    before: string,
    after: string = "",
    placeholder: string = "",
  ) {
    const el = textareaRef.current;
    if (!el) return;
    const start  = el.selectionStart;
    const end    = el.selectionEnd;
    const sel    = form.content.slice(start, end);
    const text   = sel || placeholder;
    const replacement = before + text + after;
    const newContent  = form.content.slice(0, start) + replacement + form.content.slice(end);
    setForm((f) => ({ ...f, content: newContent }));
    requestAnimationFrame(() => {
      el.focus();
      if (!sel && placeholder) {
        el.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      } else {
        el.setSelectionRange(start + replacement.length, start + replacement.length);
      }
    });
  }

  function insertLine(prefix: string, placeholder: string = "text") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = form.content.lastIndexOf("\n", start - 1) + 1;
    const lineEnd   = form.content.indexOf("\n", start);
    const end = lineEnd === -1 ? form.content.length : lineEnd;
    const currentLine = form.content.slice(lineStart, end);
    const newLine = currentLine.trimStart().startsWith(prefix.trim())
      ? currentLine.slice(currentLine.indexOf(prefix.trim()) + prefix.trim().length).trimStart()
      : prefix + (currentLine || placeholder);
    const newContent = form.content.slice(0, lineStart) + newLine + form.content.slice(end);
    setForm((f) => ({ ...f, content: newContent }));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length); });
  }

  function insertCodeBlock(lang: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const sel   = form.content.slice(start, el.selectionEnd);
    const placeholder = `# your ${lang} code here`;
    const block = `\n\`\`\`${lang}\n${sel || placeholder}\n\`\`\`\n`;
    const newContent = form.content.slice(0, start) + block + form.content.slice(el.selectionEnd);
    setForm((f) => ({ ...f, content: newContent }));
    setLangPicker(false);
    requestAnimationFrame(() => {
      el.focus();
      const codeStart = start + `\n\`\`\`${lang}\n`.length;
      el.setSelectionRange(codeStart, codeStart + (sel || placeholder).length);
    });
  }

  function insertTable() {
    insert(
      "\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| ",
      " | Cell 2   | Cell 3   |\n",
      "Cell 1",
    );
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === "b") { e.preventDefault(); insert("**", "**", "bold text"); return; }
    if (ctrl && e.key === "i") { e.preventDefault(); insert("*", "*", "italic text"); return; }
    if (ctrl && e.key === "k") { e.preventDefault(); insert("[", "](url)", "link text"); return; }
    if (ctrl && e.key === "`") { e.preventDefault(); insert("`", "`", "code"); return; }

    // Tab → 2 spaces (no focus loss)
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end   = el.selectionEnd;
      const newContent = form.content.slice(0, start) + "  " + form.content.slice(end);
      setForm((f) => ({ ...f, content: newContent }));
      requestAnimationFrame(() => { el.setSelectionRange(start + 2, start + 2); });
    }
  }

  const previewHtml = useMemo(() => renderMarkdown(form.content), [form.content]);
  const showEditor  = isNew || editing !== null;
  const wordCount   = form.content.trim().split(/\s+/).filter(Boolean).length;

  // ── Input class ──────────────────────────────────────────────────────────────
  const inputCls = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Blog posts</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            DB-backed posts. Merged with MDX files; DB takes precedence on slug collision.
          </p>
        </div>
        {!showEditor && (
          <button type="button" onClick={openNew}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">
            + New post
          </button>
        )}
      </div>

      {/* ── Editor ─────────────────────────────────────────────────────── */}
      {showEditor && (
        <SectionCard
          title={isNew ? "New post" : `Editing: ${editing?.title || "…"}`}
          description=""
        >
          <div className="space-y-4">
            {/* Title + Slug */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Title *</label>
                <input type="text" value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f, title,
                      slug: isNew ? title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) : f.slug,
                    }));
                  }}
                  placeholder="Post title" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Slug</label>
                <input type="text" value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated-from-title" className={inputCls} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Description <span className="font-normal text-zinc-400">(SEO meta — shown in search results)</span>
              </label>
              <input type="text" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="One-sentence summary" className={inputCls} />
            </div>

            {/* Category + Author */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                <select value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Read time <span className="font-normal text-zinc-400">(auto)</span>
                </label>
                <input type="text" value={form.read_time} readOnly
                  className={`${inputCls} cursor-default bg-zinc-50 dark:bg-zinc-800/50`} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Author</label>
                <input type="text" value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="uByte Team" className={inputCls} />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Tags <span className="font-normal text-zinc-400">(for SEO keywords)</span></label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {tag}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                      className="text-indigo-400 hover:text-indigo-700">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Type a tag and press Enter"
                  className={`flex-1 ${inputCls}`} />
                <button type="button" onClick={addTag}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400">
                  Add
                </button>
              </div>
            </div>

            {/* OG Image */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Custom OG Image URL <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input type="url" value={form.og_image}
                onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
                placeholder="https://yourdomain.com/images/cover.png" className={inputCls} />
              {form.og_image && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.og_image} alt="OG preview"
                    className="h-32 w-full rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>

            {/* ── Content editor ─────────────────────────────────────────── */}
            <div>
              {/* Toolbar + view mode */}
              <div className="mb-1 flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">

                {/* Formatting buttons */}
                <ToolbarButton title="Heading 2 (##)" onClick={() => insertLine("## ", "Heading")}
                  icon={<span className="font-bold text-[11px]">H2</span>} />
                <ToolbarButton title="Heading 3 (###)" onClick={() => insertLine("### ", "Heading")}
                  icon={<span className="font-bold text-[11px]">H3</span>} />

                <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

                <ToolbarButton title="Bold (Ctrl+B)" onClick={() => insert("**", "**", "bold text")}
                  icon={<span className="font-bold text-[12px]">B</span>} />
                <ToolbarButton title="Italic (Ctrl+I)" onClick={() => insert("*", "*", "italic text")}
                  icon={<span className="italic text-[12px]">I</span>} />
                <ToolbarButton title="Strikethrough" onClick={() => insert("~~", "~~", "strikethrough")}
                  icon={<span className="line-through text-[11px]">S</span>} />

                <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

                <ToolbarButton title="Inline code (Ctrl+`)" onClick={() => insert("`", "`", "code")}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />

                {/* Code block with language picker */}
                <div className="relative" ref={langPickerRef}>
                  <button type="button" title="Insert code block"
                    onClick={() => setLangPicker((p) => !p)}
                    className={`flex h-7 items-center gap-1 rounded px-2 text-xs font-mono transition-colors
                      ${langPicker ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"}`}>
                    {"{ }"}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {langPicker && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                      <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Language</p>
                      {CODE_LANGUAGES.map((lang) => (
                        <button key={lang} type="button" onClick={() => insertCodeBlock(lang)}
                          className="block w-full rounded px-2 py-1.5 text-left font-mono text-xs text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300">
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

                <ToolbarButton title="Link (Ctrl+K)" onClick={() => insert("[", "](url)", "link text")}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
                <ToolbarButton title="Image" onClick={() => insert("![", "](url)", "alt text")}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />

                <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />

                <ToolbarButton title="Blockquote" onClick={() => insertLine("> ", "quote")}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>} />
                <ToolbarButton title="Bullet list" onClick={() => insertLine("- ", "list item")}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                <ToolbarButton title="Numbered list" onClick={() => insertLine("1. ", "list item")}
                  icon={<span className="text-[11px] font-bold">1.</span>} />
                <ToolbarButton title="Table" onClick={insertTable}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z" /></svg>} />
                <ToolbarButton title="Horizontal rule" onClick={() => insert("\n---\n")}
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>} />

                {/* Spacer + view mode toggle */}
                <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
                  {(["write", "split", "preview"] as const).map((mode) => (
                    <button key={mode} type="button"
                      onClick={() => setViewMode(mode)}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition-colors
                        ${viewMode === mode
                          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Word count */}
                <span className="ml-2 text-[11px] text-zinc-400">{wordCount} words</span>
              </div>

              {/* Editor area */}
              <div className={`${viewMode === "split" ? "grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700" : ""} rounded-b-lg border border-zinc-200 dark:border-zinc-700`}>
                {/* Textarea */}
                {viewMode !== "preview" && (
                  <textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    rows={viewMode === "split" ? 28 : 24}
                    placeholder={`Write in Markdown.\n\n## Heading\n\nParagraph text. Use **bold**, *italic*, \`inline code\`.\n\n\`\`\`python\n# code block\nprint("Hello")\n\`\`\``}
                    spellCheck
                    className={`w-full rounded-b-lg bg-white px-4 py-3 font-mono text-sm leading-relaxed text-zinc-800 focus:outline-none dark:bg-zinc-900 dark:text-zinc-200 ${viewMode === "split" ? "rounded-bl-lg rounded-br-none" : "rounded-b-lg"} resize-y`}
                  />
                )}

                {/* Preview */}
                {viewMode !== "write" && (
                  <div
                    className={`${viewMode === "split" ? "overflow-y-auto" : ""} min-h-[300px] ${viewMode === "split" ? "rounded-br-lg" : "rounded-b-lg"} bg-white px-5 py-4 dark:bg-zinc-900`}
                    style={viewMode === "split" ? { maxHeight: "calc(28 * 1.5rem + 24px)" } : undefined}
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-sm text-zinc-400 italic">Nothing to preview yet…</p>' }}
                  />
                )}
              </div>

              {/* Keyboard shortcut hints */}
              <p className="mt-1.5 text-[11px] text-zinc-400">
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Ctrl+B</kbd> bold ·{" "}
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Ctrl+I</kbd> italic ·{" "}
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Ctrl+K</kbd> link ·{" "}
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Ctrl+`</kbd> inline code ·{" "}
                <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Tab</kbd> indent (2 spaces)
              </p>
            </div>

            {/* Published toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
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
              <button type="button" onClick={save} disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60">
                {saving ? "Saving…" : isNew ? "Create post" : "Save changes"}
              </button>
              {editing && !form.published && editing.slug && (
                <a href={`/blog/${editing.slug}?preview=1`} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  Preview draft →
                </a>
              )}
              {editing && form.published && editing.slug && (
                <a href={`/blog/${editing.slug}`} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-400">
                  View live →
                </a>
              )}
              {editing && (
                <button type="button" onClick={() => deletePost(editing)}
                  className="rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30">
                  Delete
                </button>
              )}
              <button type="button" onClick={closeEditor}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-400">
                Cancel
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Post list ──────────────────────────────────────────────────── */}
      <SectionCard title={`DB posts (${posts.length})`} description="MDX files in content/blog/ are not listed here.">
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
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Draft</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                    /blog/{post.slug} · {post.category} · {post.read_time} · {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400">
                    View
                  </a>
                  <button type="button" onClick={() => openEdit(post)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400">
                    Edit
                  </button>
                  <button type="button" onClick={() => deletePost(post)}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400">
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
