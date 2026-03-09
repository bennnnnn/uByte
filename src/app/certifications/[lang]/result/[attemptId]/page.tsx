"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getLangIcon } from "@/lib/languages/icons";
import type { ExamResultResponse } from "@/lib/exams/api-types";
import { parseJson, getApiErrorMessage } from "@/lib/fetch-utils";
import { usePassPercent } from "@/hooks/usePassPercent";
import Spinner from "@/components/Spinner";

// ── Animated score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, passed }: { score: number; passed: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const R = 52;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1200;

    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const fraction = score / 100;
  const dash = fraction * C;
  const strokeColor = passed ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={R} fill="none" strokeWidth="8"
          className="stroke-zinc-100 dark:stroke-zinc-800" />
        <circle cx="72" cy="72" r={R} fill="none" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          stroke={strokeColor}
          style={{ transition: "stroke-dasharray 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{displayed}%</span>
        <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">score</span>
      </div>
    </div>
  );
}

// ── Confetti burst (canvas-based, no dependencies) ────────────────────────────
function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#f97316"];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }));

    let frame: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.rotation += p.rotationSpeed;
        if (p.y < canvas.height) {
          alive = true;
          p.opacity = Math.max(0, 1 - p.y / (canvas.height * 0.8));
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
      }
      if (alive) frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}

// ── Share helpers ─────────────────────────────────────────────────────────────
function ShareButton({ certUrl, langName }: { certUrl: string; langName: string }) {
  const [copied, setCopied] = useState(false);

  const shareText = `I just earned my ${langName} certification on uByte! 🎓`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${langName} Certification`, text: shareText, url: certUrl });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(certUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Link copied!
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share certificate
        </>
      )}
    </button>
  );
}

// ── LinkedIn badge ────────────────────────────────────────────────────────────
function LinkedInButton({ certUrl, langName }: { certUrl: string; langName: string }) {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}&title=${encodeURIComponent(`${langName} Certification — uByte`)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0a5ba8] hover:shadow-md"
    >
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      Add to LinkedIn
    </a>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PracticeExamResultPage() {
  const { lang, attemptId } = useParams<{ lang: string; attemptId: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ExamResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const passPercent = usePassPercent(lang);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/certifications/attempt/${attemptId}/result`, { credentials: "same-origin" });
        const data = await parseJson<ExamResultResponse & { error?: string }>(res);
        if (cancelled) return;
        if (res.status === 401) { router.replace("/login"); return; }
        if (res.status === 403 || res.status === 404 || res.status === 400) {
          setError(getApiErrorMessage(res, data, "Result not found or attempt not submitted."));
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError(getApiErrorMessage(res, data, "Unable to load result."));
          setLoading(false);
          return;
        }
        const r = data as ExamResultResponse;
        setResult(r);
        if (r.passed) {
          // slight delay so the page renders first
          setTimeout(() => setShowConfetti(true), 300);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [attemptId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
        <Spinner label="Loading result…" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14">
        <p className="mb-4 text-sm text-red-500">{error ?? "Result not found."}</p>
        <Link href="/certifications" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          ← Back to certifications
        </Link>
      </div>
    );
  }

  const { score, passed, certificateId, totalQuestions } = result;
  const correctCount = Math.round((score / 100) * totalQuestions);
  const wrongCount = totalQuestions - correctCount;
  const langName = LANGUAGES[lang as SupportedLanguage]?.name ?? lang;
  const certUrl = typeof window !== "undefined"
    ? `${window.location.origin}/certifications/certificate/${certificateId}`
    : `/certifications/certificate/${certificateId}`;

  return (
    <div className="min-h-full bg-surface-page">
      {showConfetti && <ConfettiBurst />}

      {/* ── Pass / Fail banner ─────────────────────────────────────────────── */}
      <div className={`border-b px-4 py-5 text-center ${
        passed
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-teal-950/40"
          : "border-red-100 bg-red-50/60 dark:border-red-900/30 dark:bg-red-950/20"
      }`}>
        <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {passed ? "🎉 Congratulations! You passed." : "Keep going — you've got this."}
        </p>
        <p className={`mt-1 text-sm font-medium ${
          passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        }`}>
          {passed
            ? `You earned your ${langName} certification!`
            : `You need ${passPercent}% to pass. Review the material and try again.`}
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href={`/certifications/${lang}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to {langName} exam
        </Link>

        {/* ── Score card ─────────────────────────────────────────────────── */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:items-start">
            <ScoreRing score={score} passed={passed} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Your score</p>
              <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {langName} Certification Exam
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm dark:bg-emerald-900/40">✅</span>
                  <div>
                    <p className="text-xs text-zinc-400">Correct</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{correctCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-sm dark:bg-red-900/40">❌</span>
                  <div>
                    <p className="text-xs text-zinc-400">Wrong</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{wrongCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm dark:bg-zinc-800">📋</span>
                  <div>
                    <p className="text-xs text-zinc-400">Total</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{totalQuestions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm dark:bg-amber-900/40">🎯</span>
                  <div>
                    <p className="text-xs text-zinc-400">Pass mark</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{passPercent}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>0%</span>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                Pass threshold: {passPercent}%
              </span>
              <span>100%</span>
            </div>
            <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              {/* Pass threshold marker */}
              <div
                className="absolute top-0 z-10 h-full w-0.5 bg-zinc-400 dark:bg-zinc-500"
                style={{ left: `${passPercent}%` }}
              />
              {/* Score bar */}
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  passed ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Certificate section (pass) ─────────────────────────────────── */}
        {passed && certificateId ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800/60 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white shadow-md shadow-emerald-500/30">
                  🎓
                </div>
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-100">Certificate unlocked</p>
                  <p className="mt-0.5 text-sm text-emerald-800/80 dark:text-emerald-200/70">
                    Your verifiable {langName} certificate is ready to share on LinkedIn, attach to job applications, or link from your portfolio.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-emerald-200/70 bg-white/50 px-6 py-4 dark:border-emerald-800/40 dark:bg-zinc-900/40">
              <Link
                href={`/certifications/certificate/${certificateId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View certificate
              </Link>
              <LinkedInButton certUrl={certUrl} langName={langName} />
              <ShareButton certUrl={certUrl} langName={langName} />
              <Link
                href="/profile?tab=certifications"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
              >
                My certifications
              </Link>
            </div>
          </div>
        ) : (
          /* ── Retake section (fail) ──────────────────────────────────────── */
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl dark:bg-indigo-900/40">
                📚
              </div>
              <div className="flex-1">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Ready to try again?</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Questions are randomized each attempt. Review the tutorials to strengthen the areas where you struggled.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/certifications/${lang}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                  >
                    Retake {langName} exam
                  </Link>
                  <Link
                    href={`/tutorial/${lang}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Review tutorials
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Other certifications ──────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-200">Explore other certifications</p>
          <div className="flex flex-wrap gap-2">
            {(["go", "python", "javascript", "java", "rust", "cpp"] as SupportedLanguage[])
              .filter((l) => l !== lang)
              .map((l) => {
                const cfg = LANGUAGES[l];
                return (
                  <Link
                    key={l}
                    href={`/certifications/${l}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
                  >
                    <span>{getLangIcon(l)}</span>
                    {cfg?.name ?? l}
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Attempt ID (collapsed) */}
        <details className="mt-6 text-sm">
          <summary className="cursor-pointer select-none text-xs text-zinc-400 hover:text-zinc-500">
            Attempt details
          </summary>
          <p className="mt-2 font-mono text-xs text-zinc-400">
            Attempt ID: {attemptId}
          </p>
        </details>
      </div>
    </div>
  );
}
