"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import type { TutorialMessage } from "@/lib/db";

interface Props {
  chatSlug: string;
  lang?: string;
  onClose: () => void;
  currentCode?: string;
  inline?: boolean;
}

function MessageBubble({ msg }: { msg: TutorialMessage }) {
  const isAi = msg.is_ai;

  // Render content with code block support
  function renderContent(text: string) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lines = part.slice(3).split("\n");
        // strip language identifier line
        if (lines[0].match(/^\w+$/)) lines.shift();
        // strip trailing ```
        if (lines[lines.length - 1] === "```") lines.pop();
        return (
          <pre key={i} className="mt-1 overflow-x-auto rounded bg-zinc-900 p-2 text-xs text-zinc-100">
            <code>{lines.join("\n")}</code>
          </pre>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  }

  return (
    <div className={`flex gap-2 ${isAi ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        isAi
          ? "bg-indigo-600 text-white"
          : "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
      }`}>
        {isAi ? "AI" : msg.user_name.charAt(0).toUpperCase()}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
        isAi
          ? "rounded-tl-sm bg-indigo-50 text-zinc-800 dark:bg-indigo-950/60 dark:text-zinc-100"
          : "rounded-tr-sm bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700"
      }`}>
        <p className="mb-0.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
          {msg.user_name}
        </p>
        <div className="leading-relaxed">{renderContent(msg.content)}</div>
      </div>
    </div>
  );
}

export default function TutorialChat({ chatSlug, lang, onClose, currentCode, inline = false }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TutorialMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages on mount
  useEffect(() => {
    fetch(`/api/chat?slug=${encodeURIComponent(chatSlug)}`)
      .then((r) => r.json())
      .then((data) => { setMessages(data.messages ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chatSlug]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !user) return;
    setInput("");
    setSending(true);

    // Optimistic user message
    const tempId = Date.now();
    const optimistic: TutorialMessage = {
      id: tempId,
      tutorial_slug: chatSlug,
      user_id: null,
      user_name: user.name,
      is_ai: false,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: chatSlug, content: text, currentCode, lang: lang ?? "go" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== tempId).concat([data.userMessage, data.aiMessage])
        );
      }
    } catch {
      // revert optimistic on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header — hidden in inline mode */}
      {!inline && (
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">AI</div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Community Chat</p>
              <p className="text-[10px] text-zinc-400">Ask a question — uByte AI answers instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close chat"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>
      )}

      {/* Messages */}
      <div className={`space-y-3 overflow-y-auto p-3 ${inline ? "max-h-52" : "flex-1 p-4"}`}>
        {loading && (
          <p className="text-center text-xs text-zinc-400">Loading messages…</p>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 pt-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl dark:bg-indigo-950/60">💬</div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No questions yet</p>
            <p className="text-xs text-zinc-400">Be the first to ask something about this tutorial!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {sending && (
          <div className="flex justify-start gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">AI</div>
            <div className="rounded-2xl rounded-tl-sm bg-indigo-50 px-3 py-2 dark:bg-indigo-950/60">
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">uByte AI</p>
              <div className="flex gap-1 pt-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
        {user ? (
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              aria-label="Chat message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inline ? "Ask a follow-up…" : "Ask a question… (Enter to send)"}
              rows={inline ? 1 : 2}
              disabled={sending}
              className="flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="self-end rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            <Link href="/" className="text-indigo-500 hover:underline">Sign in</Link> to ask questions
          </p>
        )}
        <p className="mt-1.5 text-center text-[10px] text-zinc-400 dark:text-zinc-600">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
