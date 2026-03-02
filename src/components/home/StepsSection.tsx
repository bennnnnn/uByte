const STEPS = [
  {
    number: "01",
    icon: "📖",
    label: "Read",
    desc: "Short, focused lessons with clear explanations and real examples.",
    color: "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900/50",
    num: "text-blue-200 dark:text-blue-900",
  },
  {
    number: "02",
    icon: "✏️",
    label: "Code",
    desc: "Edit real code directly in your browser — no installs, no setup.",
    color: "from-violet-500/10 to-violet-600/5 border-violet-200 dark:border-violet-900/50",
    num: "text-violet-200 dark:text-violet-900",
  },
  {
    number: "03",
    icon: "✓",
    label: "Check",
    desc: "Instant feedback tells you if your output matches the expected result.",
    color: "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-900/50",
    num: "text-emerald-200 dark:text-emerald-900",
  },
  {
    number: "04",
    icon: "🏆",
    label: "Level up",
    desc: "Earn XP, maintain streaks, and track your progress across languages.",
    color: "from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-900/50",
    num: "text-amber-200 dark:text-amber-900",
  },
];

export default function StepsSection() {
  return (
    <section aria-labelledby="how-heading">
      <h2 id="how-heading" className="sr-only">How it works</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEPS.map((step) => (
          <div
            key={step.label}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 ${step.color}`}
          >
            {/* Big background number */}
            <span className={`pointer-events-none absolute -right-2 -top-2 select-none text-6xl font-black ${step.num}`}>
              {step.number}
            </span>

            <div className="relative">
              <div className="mb-2 text-2xl">{step.icon}</div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
