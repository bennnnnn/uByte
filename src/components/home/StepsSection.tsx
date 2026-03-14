import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    number: "01",
    label: "Learn",
    desc: "Short, focused tutorials with real code examples. Zero setup — write and run code right in your browser.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    number: "02",
    label: "Practice",
    desc: "Solve real interview problems to sharpen the skills interviewers actually test. Same IDE, every language we support.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    label: "Certify",
    desc: "Take a timed exam and earn a certificate that proves you've truly mastered the language.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    number: "04",
    label: "Get hired",
    desc: "Walk into any technical interview job-ready — with proof of your skills to back it up.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function StepsSection() {
  return (
    <section aria-labelledby="how-heading">
      <SectionHeading
        id="how-heading"
        eyebrow="How it works"
        title="Your complete coding journey."
        subtitle="From your first line of code to a certification — everything in one place."
        className="mb-12"
      />

      <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-4">
        {/* Connecting line through the icon circles */}
        <div aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-700 sm:block" />

        {STEPS.map((s) => (
          <div key={s.label} className="relative z-10 flex flex-col gap-4">
            {/* Icon circle */}
            <div className="flex justify-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
                {s.icon}
              </div>
            </div>

            {/* Card */}
            <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#F7F8FF] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{s.number}</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.label}</p>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
