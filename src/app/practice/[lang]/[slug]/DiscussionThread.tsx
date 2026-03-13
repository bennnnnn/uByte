"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Post {
  id: number;
  user_id: number | null;
  parent_id: number | null;
  body: string;
  created_at: string;
  author_name: string | null;
  reply_count: number;
  replies?: Post[];
  repliesLoading?: boolean;
  repliesOpen?: boolean;
}

interface Props {
  slug: string;
  currentUserId: number | null;
  isSignedIn: boolean;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)  return "just now";
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

/** Renders @mention tokens as highlighted spans */
function BodyText({ text }: { text: string }) {
  const parts = text.split(/(@[\w.-]+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        /^@[\w.-]+$/.test(part) ? (
          <span key={i} className="font-medium text-indigo-600 dark:text-indigo-400">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

/* ── Avatar ─────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];
function avatarColor(name: string | null): string {
  const idx = (name ?? "?").charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/* ── Compose box ────────────────────────────────────────────────────────── */
function ComposeBox({
  placeholder,
  onSubmit,
  onCancel,
  autoFocus = false,
}: {
  placeholder: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void submit();
        }}
        className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
      />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || !text.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
        )}
        <span className="ml-auto text-[10px] text-zinc-400">{text.length}/2000 · ⌘↵ to post</span>
      </div>
    </div>
  );
}

/* ── Single post card ───────────────────────────────────────────────────── */
function PostCard({
  post,
  currentUserId,
  isReply,
  onReplySubmit,
  onDelete,
  onToggleReplies,
  onLoadReplies,
}: {
  post: Post;
  currentUserId: number | null;
  isReply: boolean;
  onReplySubmit: (postId: number, text: string) => Promise<void>;
  onDelete: (postId: number) => void;
  onToggleReplies: (postId: number) => void;
  onLoadReplies: (postId: number) => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canDelete = currentUserId && post.user_id === currentUserId;

  const handleToggle = async () => {
    onToggleReplies(post.id);
    if (!post.repliesOpen && !post.replies) {
      await onLoadReplies(post.id);
    }
  };

  return (
    <div className={`flex gap-3 ${isReply ? "pl-2" : ""}`}>
      {/* Avatar */}
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(post.author_name)}`}>
        {initials(post.author_name)}
      </div>

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {post.author_name ?? "Anonymous"}
          </span>
          <span className="text-[10px] text-zinc-400">{timeAgo(post.created_at)}</span>
        </div>

        {/* Body */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <BodyText text={post.body} />
        </p>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-3">
          {!isReply && currentUserId && (
            <button
              type="button"
              onClick={() => setReplying((r) => !r)}
              className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Reply
            </button>
          )}

          {!isReply && post.reply_count > 0 && (
            <button
              type="button"
              onClick={() => void handleToggle()}
              className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {post.repliesOpen ? (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  Hide replies
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
                </>
              )}
            </button>
          )}

          {canDelete && (
            confirmDelete ? (
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="text-zinc-400">Delete?</span>
                <button type="button" onClick={() => onDelete(post.id)} className="font-medium text-red-500 hover:text-red-700">Yes</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-zinc-400 hover:text-zinc-600">No</button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-[11px] text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600"
              >
                Delete
              </button>
            )
          )}
        </div>

        {/* Inline reply form */}
        {replying && (
          <div className="mt-3">
            <ComposeBox
              placeholder={`Reply to ${post.author_name ?? "this comment"}… (use @name to mention)`}
              autoFocus
              onCancel={() => setReplying(false)}
              onSubmit={async (text) => {
                await onReplySubmit(post.id, text);
                setReplying(false);
              }}
            />
          </div>
        )}

        {/* Replies */}
        {!isReply && post.repliesOpen && (
          <div className="mt-3 space-y-3 border-l-2 border-zinc-100 pl-3 dark:border-zinc-800">
            {post.repliesLoading ? (
              <p className="text-xs text-zinc-400">Loading…</p>
            ) : (post.replies ?? []).length === 0 ? (
              <p className="text-xs text-zinc-400">No replies yet.</p>
            ) : (
              (post.replies ?? []).map((reply) => (
                <PostCard
                  key={reply.id}
                  post={reply}
                  currentUserId={currentUserId}
                  isReply
                  onReplySubmit={onReplySubmit}
                  onDelete={onDelete}
                  onToggleReplies={onToggleReplies}
                  onLoadReplies={onLoadReplies}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function DiscussionThread({ slug, currentUserId, isSignedIn }: Props) {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  /* ── Load posts ─────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await apiFetch(`/api/discussion/${slug}`);
      const data = await res.json() as { posts: Post[] };
      setPosts(data.posts ?? []);
    } catch {
      setError("Couldn't load discussion.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);

  /* ── Load replies for a post ────────────────────────────────────────── */
  const loadReplies = useCallback(async (postId: number) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, repliesLoading: true } : p));
    try {
      const res  = await apiFetch(`/api/discussion/${slug}?parent=${postId}`);
      const data = await res.json() as { replies: Post[] };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: data.replies ?? [], repliesLoading: false } : p,
        ),
      );
    } catch {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, repliesLoading: false } : p));
    }
  }, [slug]);

  /* ── Toggle replies open/closed ─────────────────────────────────────── */
  const toggleReplies = useCallback((postId: number) => {
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, repliesOpen: !p.repliesOpen } : p),
    );
  }, []);

  /* ── Submit top-level post ──────────────────────────────────────────── */
  const submitPost = useCallback(async (text: string) => {
    const res  = await apiFetch(`/api/discussion/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? "Failed to post.");
    }
    const data = await res.json() as { post: Post };
    setPosts((prev) => [...prev, { ...data.post, reply_count: 0 }]);
  }, [slug]);

  /* ── Submit reply ───────────────────────────────────────────────────── */
  const submitReply = useCallback(async (parentId: number, text: string) => {
    const res  = await apiFetch(`/api/discussion/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, parentId }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? "Failed to post.");
    }
    const data = await res.json() as { post: Post };
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== parentId) return p;
        return {
          ...p,
          reply_count: p.reply_count + 1,
          repliesOpen: true,
          replies: [...(p.replies ?? []), data.post],
        };
      }),
    );
  }, [slug]);

  /* ── Delete post ────────────────────────────────────────────────────── */
  const deletePost = useCallback(async (id: number) => {
    await apiFetch(`/api/discussion/post/${id}`, { method: "DELETE" });
    // Remove from top-level or from replies
    setPosts((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p) => ({
          ...p,
          replies: p.replies?.filter((r) => r.id !== id),
          reply_count: p.replies?.some((r) => r.id === id) ? p.reply_count - 1 : p.reply_count,
        })),
    );
  }, []);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {posts.length > 0 ? `${posts.length} comment${posts.length !== 1 ? "s" : ""}` : "Discussion"}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">

        {/* New post compose box */}
        {isSignedIn ? (
          <div className="mb-5">
            <ComposeBox
              placeholder="Share your approach, ask a question… Use @name to mention someone."
              onSubmit={submitPost}
            />
          </div>
        ) : (
          <div className="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link>{" "}
              to join the discussion.
            </p>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No comments yet.</p>
            <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-700">Be the first to share your approach!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isReply={false}
                onReplySubmit={submitReply}
                onDelete={(id) => void deletePost(id)}
                onToggleReplies={toggleReplies}
                onLoadReplies={loadReplies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
