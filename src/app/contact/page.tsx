"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

const SUBJECTS = [
  "General question",
  "Billing & subscription",
  "Bug report",
  "Feature request",
  "Certificate / exam issue",
  "Account problem",
  "Privacy / data request",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setError(d.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Get in touch</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          We typically respond within one business day.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: "📧", label: "Email us", value: "support@ubyte.dev", href: "mailto:support@ubyte.dev" },
          { icon: "🔒", label: "Privacy", value: "privacy@ubyte.dev", href: "mailto:privacy@ubyte.dev" },
          { icon: "📖", label: "Docs & FAQ", value: "Browse help center", href: "/help" },
        ].map(({ icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-5 text-center transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
          >
            <span className="mb-2 text-2xl">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</span>
            <span className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{value}</span>
          </a>
        ))}
      </div>

      {/* Form */}
      {status === "sent" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <p className="text-2xl">✅</p>
          <h2 className="mt-3 text-lg font-bold text-emerald-800 dark:text-emerald-300">Message sent!</h2>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            We&apos;ve received your message and will reply to <strong>{form.email}</strong> within one business day.
          </p>
          <button
            type="button"
            onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); }}
            className="mt-5 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={form.name}
                onChange={set("name")}
                placeholder="Your name"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Subject
            </label>
            <select
              id="subject"
              value={form.subject}
              onChange={set("subject")}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={6}
              maxLength={5000}
              value={form.message}
              onChange={set("message")}
              placeholder="Describe your question or issue in detail…"
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{form.message.length}/5000</p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          <p className="text-center text-xs text-zinc-400">
            By submitting this form you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      )}
    </div>
  );
}
