import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";

const CERT_LANGUAGES = [
  { slug: "go",         name: "Go"         },
  { slug: "python",     name: "Python"     },
  { slug: "javascript", name: "JavaScript" },
  { slug: "java",       name: "Java"       },
  { slug: "rust",       name: "Rust"       },
  { slug: "cpp",        name: "C++"        },
  { slug: "csharp",     name: "C#"         },
];

interface Props {
  totalCertificates: number;
  totalAttempts: number;
}

export default function CertificationsHighlight({ totalCertificates, totalAttempts }: Props) {
  return (
    <section aria-labelledby="certs-highlight-heading" className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/20">
      <div className="px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="max-w-md">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              🎓 Free certifications
            </p>
            <h2 id="certs-highlight-heading" className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Prove what you know.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Take a timed exam and earn a verifiable certificate — free for everyone.
              The exams are genuinely hard. Passing one means something.
            </p>

            {/* Stats */}
            {totalCertificates > 0 && (
              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-xl font-black text-indigo-600">{totalCertificates.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">certificates issued</p>
                </div>
                {totalAttempts > 0 && (
                  <div>
                    <p className="text-xl font-black text-indigo-600">{totalAttempts.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">exams taken</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <Link
                href="/certifications"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
              >
                Browse certifications
              </Link>
              <Link
                href="/tutorial/go"
                className="rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-transparent dark:text-indigo-400"
              >
                Study first →
              </Link>
            </div>
          </div>

          {/* Right — language badges */}
          <div className="flex flex-wrap gap-2 sm:max-w-xs">
            {CERT_LANGUAGES.map(lang => (
              <Link
                key={lang.slug}
                href={`/certifications/${lang.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow dark:border-indigo-800/40 dark:bg-zinc-800/60 dark:text-zinc-200"
              >
                <span>{getLangIcon(lang.slug)}</span>
                <span>{lang.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
