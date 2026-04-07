"use client";

import { applyTheme } from "@/lib/theme";

interface Props {
  editTheme: string;
  onChangeTheme: (t: string) => void;
}

export default function AppearanceSection({ editTheme, onChangeTheme }: Props) {
  return (
    <section>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">Appearance</h3>
      <div className="flex gap-2">
        {(["light", "dark", "system"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { onChangeTheme(t); applyTheme(t); }}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
              editTheme === t
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
            }`}
          >
            {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"} {t}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Dark mode is available on tutorial pages only. All other pages use light mode.
      </p>
    </section>
  );
}
