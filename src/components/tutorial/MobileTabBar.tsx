"use client";

type MobileTab = "instructions" | "ask" | "code";

const TAB_ICONS: Record<MobileTab, React.ReactNode> = {
  instructions: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  ask: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  code: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

const TAB_LABELS: Record<MobileTab, string> = {
  instructions: "Steps",
  ask: "Ask",
  code: "Code",
};

interface Props {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasOutputError: boolean;
}

export default function MobileTabBar({
  activeTab,
  onTabChange,
  hasOutputError,
}: Props) {
  return (
    <div className="flex shrink-0 items-stretch border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
      {(["instructions", "ask", "code"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          aria-label={TAB_LABELS[tab]}
          className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
            activeTab === tab
              ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          }`}
        >
          {TAB_ICONS[tab]}
          <span>{TAB_LABELS[tab]}</span>
          {tab === "code" && hasOutputError && activeTab !== "code" && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
      ))}
    </div>
  );
}
