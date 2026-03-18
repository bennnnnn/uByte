"use client";

type MobileTab = "instructions" | "discuss" | "code";

interface Props {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasOutputError: boolean;
  fontSize: 14 | 16 | 18;
  onFontSizeChange: (size: 14 | 16 | 18) => void;
}

export default function MobileTabBar({
  activeTab,
  onTabChange,
  hasOutputError,
  fontSize,
  onFontSizeChange,
}: Props) {
  return (
    <div className="flex shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 md:hidden">
      {(["instructions", "discuss", "code"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === tab
              ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {tab === "instructions" ? (
            "Instructions"
          ) : tab === "discuss" ? (
            "Discuss"
          ) : (
            <>
              Code
              {hasOutputError && activeTab !== "code" && (
                <span className="absolute right-1 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </>
          )}
        </button>
      ))}

      {activeTab === "code" && (
        <div className="flex items-center gap-0.5 px-1.5">
          <button
            onClick={() => {
              const s = fontSize === 18 ? 16 : 14;
              onFontSizeChange(s);
              try { localStorage.setItem("ide-font-size", String(s)); } catch { /* ignore */ }
            }}
            aria-label="Decrease font size"
            className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            A⁻
          </button>
          <button
            onClick={() => {
              const s = fontSize === 14 ? 16 : 18;
              onFontSizeChange(s);
              try { localStorage.setItem("ide-font-size", String(s)); } catch { /* ignore */ }
            }}
            aria-label="Increase font size"
            className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            A⁺
          </button>
        </div>
      )}
    </div>
  );
}
