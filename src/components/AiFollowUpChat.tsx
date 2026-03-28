"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { MAX_USER_MESSAGE_LENGTH } from "@/lib/ai/chat-constants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  submissionId: number;
  isPro: boolean;
}

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3).split("\n");
      if (lines[0].match(/^\w+$/)) lines.shift();
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

export default function AiFollowUpChat({ submissionId, isPro }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyLimitHit, setDailyLimitHit] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const charsLeft = MAX_USER_MESSAGE_LENGTH - input.length;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setDailyLimitHit(false);
    setSending(true);

    const newHistory: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newHistory);

    try {
      const res = await apiFetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          message: text,
          history: messages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setDailyLimitHit(true);
        } else {
          setError(data.error ?? "Something went wrong.");
        }
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setMessages([...newHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error. Try again.");
      setMessages((prev) => prev.slice(0, -1));
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

  if (!isPro) {
    return (
      <div className="mt-2 flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">Ask a follow-up</span>
          {" — available on Pro."}
        </p>
        <Link
          href="/pricing"
          className="shrink-0 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Ask a follow-up
        </button>
      ) : (
        <div className="rounded-lg border border-indigo-200 bg-white dark:border-indigo-800/60 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-100 px-3 py-2 dark:border-indigo-900/40">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Ask a follow-up
            </span>
            <span className="text-[10px] text-zinc-400">Pro · fair use applies</span>
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-y-auto p-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    msg.role === "assistant"
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                  }`}>
                    {msg.role === "assistant" ? "AI" : "U"}
                  </div>
                  <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
                    msg.role === "assistant"
                      ? "rounded-tl-sm bg-indigo-50 text-zinc-800 dark:bg-indigo-950/50 dark:text-zinc-100"
                      : "rounded-tr-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">AI</div>
                  <div className="flex items-center gap-1 rounded-xl rounded-tl-sm bg-indigo-50 px-2.5 py-2 dark:bg-indigo-950/50">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Daily limit banner */}
          {dailyLimitHit && (
            <div className="mx-2 mb-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/40">
              <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Daily AI limit reached</p>
              <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                Your 10 daily AI calls are shared across all problems, hints, and explanations — not per problem. Resets at midnight.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="px-3 pb-1 text-[11px] text-red-500 dark:text-red-400">{error}</p>
          )}

          {/* Input */}
          <div className="p-2">
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_USER_MESSAGE_LENGTH))}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this problem… (Enter to send)"
                  rows={1}
                  disabled={sending || dailyLimitHit}
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
                {input.length > MAX_USER_MESSAGE_LENGTH * 0.8 && (
                  <span className={`absolute bottom-1 right-2 text-[9px] ${charsLeft < 20 ? "text-red-400" : "text-zinc-400"}`}>
                    {charsLeft}
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || dailyLimitHit}
                className="self-end rounded-lg bg-indigo-600 px-2 py-1.5 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                aria-label="Send"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
