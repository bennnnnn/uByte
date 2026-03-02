const STEPS = [
  {
    number: "01",
    icon: "📖",
    label: "Read",
    desc: "Short, focused lessons with clear explanations and real examples.",
    card: "border-blue-200 bg-gradient-to-br from-white to-blue-50/60 dark:border-blue-900/40 dark:from-zinc-900 dark:to-blue-950/20",
    num:  "text-blue-100 dark:text-blue-950",
    dot:  "bg-blue-500",
  },
  {
    number: "02",
    icon: "✏️",
    label: "Code",
    desc: "Edit real code directly in your browser — no installs, no setup.",
    card: "border-violet-200 bg-gradient-to-br from-white to-violet-50/60 dark:border-violet-900/40 dark:from-zinc-900 dark:to-violet-950/20",
    num:  "text-violet-100 dark:text-violet-950",
    dot:  "bg-violet-500",
  },
  {
    number: "03",
    icon: "✓",
    label: "Check",
    desc: "Instant feedback tells you if your output matches the expected result.",
    card: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60 dark:border-emerald-900/40 dark:from-zinc-900 dark:to-emerald-950/20",
    num:  "text-emerald-100 dark:text-emerald-950",
    dot:  "bg-emerald-500",
  },
  {
    number: "04",
    icon: "🏆",
    label: "Level up",
    desc: "Earn XP, maintain streaks, and track your progress across all languages.",
    card: "border-amber-200 bg-gradient-to-br from-white to-amber-50/60 dark:border-amber-900/40 dark:from-zinc-900 dark:to-amber-950/20",
    num:  "text-amber-100 dark:text-amber-950",
    dot:  "bg-amber-500",
  },
];

export default function StepsSection() {
  return (
    <section aria-labelledby="how-heading">
      <div className="mb-8 text-center">
        <h2
          id="how-heading"
          className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Four steps between you and fluency in a new language.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STEPS.map((step) => (
          <div
            key={step.label}
            className={`relative overflow-hidden rounded-2xl border p-5 transition-shadow hover:shadow-md ${step.card}`}
          >
            {/* Large background number */}
            <span
              className={`pointer-events-none absolute -right-2 -top-3 select-none text-7xl font-black leading-none ${step.num}`}
            >
              {step.number}
            </span>

            <div className="relative">
              {/* Coloured dot */}
              <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${step.dot} text-base text-white shadow`}>
                {step.icon}
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {step.label}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
