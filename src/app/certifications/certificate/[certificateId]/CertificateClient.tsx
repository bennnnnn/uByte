"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { CertificatePayload } from "@/lib/exams/api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";
import { Button } from "@/components/ui";
import Spinner from "@/components/Spinner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CertificateClient() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [data, setData] = useState<CertificatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/certifications/certificate/${certificateId}`);
        const json = await parseJson<CertificatePayload & { error?: string }>(res);
        if (cancelled) return;
        if (!res.ok) {
          setError(getApiErrorMessage(res, json, "Unable to load certificate."));
          return;
        }
        setData(json as CertificatePayload);
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const pdfUrl = `/api/certifications/certificate/${certificateId}/pdf`;

  /**
   * LinkedIn "Add to Profile" deeplink.
   * Format: https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&...
   * Replace organizationName with your LinkedIn Company Page ID when it exists.
   */
  const buildLinkedInUrl = () => {
    if (!data) return "#";
    const issued = new Date(data.passedAt);
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: `${LANGUAGES[data.lang as SupportedLanguage]?.name ?? data.lang} Certification`,
      organizationName: "uByte",
      issueYear: String(issued.getFullYear()),
      issueMonth: String(issued.getMonth() + 1),
      certUrl: typeof window !== "undefined" ? window.location.href : `https://ubyte.dev/certifications/certificate/${data.id}`,
      certId: data.id,
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${data?.name} — ${data?.lang} Certificate`, url });
        return;
      } catch { /* user cancelled or not supported — fall through to clipboard */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (non-secure context or permission denied) — no-op
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="mb-3 text-sm text-red-500">{error}</p>
          <Link
            href="/certifications"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            ← Browse certifications
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center" aria-live="polite" aria-busy="true">
        <Spinner label="Loading certificate…" />
      </div>
    );
  }

  const langConfig = LANGUAGES[data.lang as SupportedLanguage];

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center px-4 py-10 print:bg-white">
      {/* Action bar */}
      <div className="mb-4 flex w-full max-w-3xl items-center justify-between print:hidden">
        <Link
          href="/certifications"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Certifications
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleShare}
          >
            {copied ? "Copied!" : "Share"}
          </Button>
          {/* LinkedIn Add to Profile — lets the user add this cert to their LinkedIn in 2 clicks */}
          <a
            href={buildLinkedInUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0077B5] bg-white px-4 py-2.5 text-sm font-semibold text-[#0077B5] transition-all hover:bg-[#0077B5] hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Add to LinkedIn
          </a>
          <a
            href={pdfUrl}
            download={data ? `uByte-${LANGUAGES[data.lang as SupportedLanguage]?.name ?? data.lang}-Certificate-${data.id.slice(0, 8)}.pdf` : "uByte-Certificate.pdf"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Certificate card */}
      <div className="w-full max-w-3xl rounded-2xl border-4 border-indigo-500 bg-surface-card p-10 text-center shadow-2xl dark:border-indigo-600 print:shadow-none">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
          <span className="text-3xl">🎓</span>
          <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Certificate of Completion
        </p>

        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          This certifies that
        </p>

        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {data.name}
        </h1>

        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          has successfully passed the
        </p>

        <p className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {langConfig?.name ?? data.lang} Certification Exam
        </p>

        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          demonstrating proficiency in core concepts and problem solving in{" "}
          {langConfig?.name ?? data.lang}.
        </p>

        {/* Footer with ID and date */}
        <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Certificate ID: {data.id}</span>
            <span>Issued {formatDate(data.passedAt)}</span>
          </div>
        </div>
      </div>

      {/* Verification badge */}
      <div className="mt-5 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm dark:border-emerald-800/40 dark:bg-emerald-950/20 print:hidden">
        <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-2.108-3.653 3 3 0 00-3.75-2.164 3 3 0 00-4.59 0 3 3 0 00-3.75 2.164A3 3 0 00.097 7.348a3 3 0 010 5.304 3 3 0 002.108 3.653 3 3 0 003.75 2.164 3 3 0 004.59 0 3 3 0 003.75-2.164 3 3 0 002.108-3.653zM8.75 12.53a.75.75 0 001.06 0l3.5-3.5a.75.75 0 00-1.06-1.06L9.28 10.94l-1.53-1.53a.75.75 0 00-1.06 1.06l2.06 2.06z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-emerald-700 dark:text-emerald-300">Verified certificate</span>
        <span className="text-emerald-600/70 dark:text-emerald-400/70">· issued by uByte</span>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400 print:hidden">
        This certificate is publicly verifiable. Anyone with this link can confirm its authenticity.
      </p>

      {/* ── Conversion CTA for viewers ─────────────────────────────────── */}
      <div className="mt-10 w-full max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50 p-6 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20 print:hidden">
        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Want your own {langConfig?.name ?? data.lang} certificate?
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Take the timed {langConfig?.name ?? data.lang} certification exam. Pass and earn a verifiable certificate you can share anywhere.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/certifications/${data.lang}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Get certified in {langConfig?.name ?? data.lang}
          </Link>
          <Link
            href="/certifications"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
          >
            Browse all certifications
          </Link>
        </div>
      </div>
    </div>
  );
}

