import Link from "next/link";

const PILLARS = [
  {
    icon: "📖",
    title: "Tutorials",
    desc: "Step-by-step interactive lessons. Write real code in your browser across all 6 languages.",
  },
  {
    icon: "🎯",
    title: "Interview Prep",
    desc: "LeetCode-style problems covering arrays, strings, dynamic programming, and more.",
  },
  {
    icon: "🏅",
    title: "Certifications",
    desc: "Pass a timed exam, download a verifiable certificate, share it on LinkedIn.",
  },
];

export default function ValuePropBanner() {
  return (
    <section
      aria-labelledby="value-prop-heading"
      className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-500/20 sm:p-10 dark:border-indigo-700/50"
    >
      <div className="mb-8 text-center">
        <h2
          id="value-prop-heading"
          className="text-2xl font-black tracking-tight sm:text-3xl"
        >
          Everything you need to go from learner to hire-ready.
        </h2>
        <p className="mt-2 text-sm font-medium text-indigo-200 sm:text-base">
          One subscription. Three powerful tools. All 6 languages.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl bg-white/10 p-5 backdrop-blur-sm"
          >
            <span className="mb-3 block text-3xl">{p.icon}</span>
            <p className="mb-1.5 text-sm font-bold">{p.title}</p>
            <p className="text-xs leading-relaxed text-indigo-100">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow transition-all hover:-translate-y-0.5 hover:bg-indigo-50"
        >
          See plans — from $9.99/mo
        </Link>
        <Link
          href="/tutorial/go"
          className="text-sm font-semibold text-indigo-200 underline-offset-2 hover:text-white hover:underline"
        >
          Start free first →
        </Link>
      </div>
    </section>
  );
}
