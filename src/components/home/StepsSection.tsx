const CARD_STYLE =
  "border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 dark:border-indigo-900/40 dark:from-zinc-900 dark:to-indigo-950/20";
const NUM_STYLE = "text-indigo-100 dark:text-indigo-950";
const DOT_STYLE = "bg-indigo-500";

const STEPS = [
  {
    number: "01",
    icon: "📖",
    label: "Read",
    desc: "Short, focused lessons with clear explanations and real examples.",
    card: CARD_STYLE,
    num: NUM_STYLE,
    dot: DOT_STYLE,
  },
  {
    number: "02",
    icon: "✏️",
    label: "Code",
    desc: "Edit real code directly in your browser — no installs, no setup.",
    card: CARD_STYLE,
    num: NUM_STYLE,
    dot: DOT_STYLE,
  },
  {
    number: "03",
    icon: "✓",
    label: "Check",
    desc: "Instant feedback tells you if your output matches the expected result.",
    card: CARD_STYLE,
    num: NUM_STYLE,
    dot: DOT_STYLE,
  },
  {
    number: "04",
    icon: "🏆",
    label: "Level up",
    desc: "Earn XP, maintain streaks, and track your progress across all languages.",
    card: CARD_STYLE,
    num: NUM_STYLE,
    dot: DOT_STYLE,
  },
];

export default function StepsSection() {
  return (
    <section aria-labelledby="how-heading">
      <div className="mb-10 text-center">
        <h2
          id="how-heading"
          className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
          Four steps. Zero setup. Real code.
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Flow connector line (visible on larger screens) */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-12 hidden border-t-2 border-dashed border-zinc-200 dark:border-zinc-700 sm:block"
        />

        {STEPS.map((step) => (
          <div
            key={step.label}
            className={`relative z-10 overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${step.card}`}
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
