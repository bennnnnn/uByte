"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

type Difficulty = "easy" | "medium" | "hard";
type Outcome    = "offer" | "rejection" | "ongoing" | "ghosted";
type Status     = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM = {
  company: "",
  role: "",
  difficulty: "medium" as Difficulty,
  outcome: "rejection" as Outcome,
  rounds: "",
  tips: "",
  anonymous: true,
};

export default function SubmitInterviewPage() {
  const router  = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError]   = useState("");

  const set = <K extends keyof typeof form>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggle = (k: keyof typeof form) =>
    setForm((f) => ({ ...f, [k]: !f[k as "anonymous"] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await apiFetch("/api/interview-experiences", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus("success");
      setTimeout(() => router.push("/interviews"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        </div>
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">Thanks for sharing!</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your experience has been submitted and will be visible after a quick review. Redirecting you back…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href="/interviews" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to interviews
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Share your interview experience</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Help other developers know what to expect. You can post completely anonymously.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">

        {/* Company + Role */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Company *</label>
            <input
              required
              type="text"
              value={form.company}
              onChange={set("company")}
              placeholder="e.g. Google, Meta, Stripe…"
              maxLength={120}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Role / Position *</label>
            <input
              required
              type="text"
              value={form.role}
              onChange={set("role")}
              placeholder="e.g. Software Engineer L4"
              maxLength={120}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Difficulty + Outcome */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Difficulty *</label>
            <select
              value={form.difficulty}
              onChange={set("difficulty")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Outcome *</label>
            <select
              value={form.outcome}
              onChange={set("outcome")}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="offer">Got the offer</option>
              <option value="rejection">Rejected</option>
              <option value="ongoing">Still ongoing</option>
              <option value="ghosted">Ghosted</option>
            </select>
          </div>
        </div>

        {/* Rounds */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Interview rounds *
          </label>
          <p className="mb-2 text-xs text-zinc-400">
            Describe each round (e.g. phone screen, technical, system design, behavioral). What questions were asked?
          </p>
          <textarea
            required
            value={form.rounds}
            onChange={set("rounds")}
            rows={7}
            maxLength={8000}
            placeholder={"Round 1 — Phone screen (30 min)\nHR call, discussed resume and background.\n\nRound 2 — Technical (60 min)\nTwo LeetCode Medium problems: Two Sum variant and a linked-list question…"}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">{form.rounds.length}/8000</p>
        </div>

        {/* Tips */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tips for future candidates <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            value={form.tips}
            onChange={set("tips")}
            rows={3}
            maxLength={2000}
            placeholder="What would you do differently? Any resources you'd recommend?"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            role="switch"
            aria-checked={form.anonymous}
            onClick={() => toggle("anonymous")}
            className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${form.anonymous ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`}
          >
            <span className={`pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.anonymous ? "translate-x-4" : ""}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Post anonymously</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {form.anonymous
                ? "Your name will NOT be shown with this post."
                : "Your display name will be shown with this post."}
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {status === "submitting" ? "Submitting…" : "Submit experience"}
          </button>
          <Link href="/interviews" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            Cancel
          </Link>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Submissions are reviewed before going live. We&apos;ll never publish company-identifying info beyond what you share here.
        </p>
      </form>
    </div>
  );
}
