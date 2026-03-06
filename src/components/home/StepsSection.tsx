import SectionHeading from "./SectionHeading";

const STEPS = [
  { number: "01", icon: "📖", label: "Read",     desc: "Short, focused lessons with clear explanations and real examples." },
  { number: "02", icon: "✏️", label: "Code",     desc: "Edit real code directly in your browser — no installs, no setup." },
  { number: "03", icon: "✓",  label: "Check",    desc: "Instant feedback tells you if your output matches the expected result." },
  { number: "04", icon: "🏆", label: "Level up", desc: "Earn XP, maintain streaks, and track your progress across all languages." },
];

const CARD_CLS = "border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 dark:border-indigo-900/40 dark:from-zinc-900 dark:to-indigo-950/20";

export default function StepsSection() {
  return (
    <section aria-labelledby="how-heading">
      <SectionHeading id="how-heading" title="How it works" subtitle="Four steps. Zero setup. Real code." className="mb-10" />

      <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div aria-hidden className="absolute left-0 right-0 top-12 hidden border-t-2 border-dashed border-zinc-200 dark:border-zinc-700 sm:block" />

        {STEPS.map((s) => (
          <div key={s.label} className={`relative z-10 overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${CARD_CLS}`}>
            <span className="pointer-events-none absolute -right-2 -top-3 select-none text-7xl font-black leading-none text-indigo-100 dark:text-indigo-950">
              {s.number}
            </span>
            <div className="relative">
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-base text-white shadow">
                {s.icon}
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
