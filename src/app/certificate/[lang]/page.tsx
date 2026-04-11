"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type CertData = {
  name: string;
  lang: string;
  langName: string;
  completedTutorials: number;
  issuedAt: string;
};

export default function CertificatePage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang ?? "go";

  const [status, setStatus] = useState<"loading" | "ready" | "ineligible" | "error">("loading");
  const [cert, setCert] = useState<CertData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/certificate/${encodeURIComponent(lang)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setCert(data);
          setStatus("ready");
        } else if (res.status === 403) {
          setErrorMsg(data.error ?? "You have not completed any tutorials for this language yet.");
          setStatus("ineligible");
        } else if (res.status === 401) {
          setErrorMsg("Sign in to view your certificate.");
          setStatus("error");
        } else {
          setErrorMsg(data.error ?? "Could not load certificate.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      });
  }, [lang]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-500" />
      </div>
    );
  }

  if (status === "ineligible" || status === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">Certificate not available</h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{errorMsg}</p>
          <Link
            href={`/tutorial/${lang}`}
            className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Start {lang} tutorials →
          </Link>
        </div>
      </div>
    );
  }

  if (!cert) return null;

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
          ← Back to dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Download / Print
        </button>
      </div>

      {/* Certificate */}
      <div className="flex items-center justify-center p-8 print:p-0">
        <div
          className="relative w-full max-w-2xl rounded-2xl border-4 border-indigo-600 bg-white p-12 text-center shadow-xl print:rounded-none print:border-0 print:shadow-none"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {/* Corner accents */}
          <div className="absolute left-4 top-4 h-8 w-8 border-l-4 border-t-4 border-indigo-300 print:hidden" />
          <div className="absolute right-4 top-4 h-8 w-8 border-r-4 border-t-4 border-indigo-300 print:hidden" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-indigo-300 print:hidden" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-indigo-300 print:hidden" />

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">uByte</p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900">Certificate of Completion</h1>

          <p className="mb-2 text-sm text-zinc-500">This certifies that</p>
          <p className="mb-4 text-4xl font-bold text-indigo-600">{cert.name}</p>

          <p className="mb-1 text-sm text-zinc-500">has successfully completed</p>
          <p className="mb-1 text-xl font-semibold text-zinc-800">
            {cert.completedTutorials} {cert.langName} Tutorial{cert.completedTutorials !== 1 ? "s" : ""}
          </p>
          <p className="mb-8 text-sm text-zinc-400">on the uByte interactive learning platform</p>

          <div className="mx-auto mb-8 h-px w-48 bg-indigo-200" />

          <p className="text-sm text-zinc-400">Issued {issuedDate}</p>

          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-2xl font-black tracking-tight text-indigo-600">uByte</span>
          </div>
        </div>
      </div>
    </div>
  );
}
