"use client";

/**
 * InterviewsTab — moderate user-submitted interview experiences.
 *
 * Pending submissions appear first. Admin can approve, reject, or delete.
 */

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { SectionCard, EmptyRow } from "../components";

type Difficulty = "easy" | "medium" | "hard";
type Outcome    = "offer" | "rejection" | "ongoing" | "ghosted";

interface Experience {
  id: number;
  user_id: number | null;
  company: string;
  role: string;
  difficulty: Difficulty;
  outcome: Outcome;
  rounds: string;
  tips: string | null;
  anonymous: boolean;
  approved: boolean;
  created_at: string;
  author_name: string | null;
  vote_score: number;
}

const DIFF_COLOR: Record<Difficulty, string> = {
  easy:   "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard:   "bg-red-50 text-red-700",
};
const OUTCOME_LABEL: Record<Outcome, string> = {
  offer: "Offer", rejection: "Rejected", ongoing: "Ongoing", ghosted: "Ghosted",
};

function formatDate(s: string): string {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InterviewsTab() {
  const [items, setItems]       = useState<Experience[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy]         = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetch("/api/admin/interviews");
      const data = await res.json() as { experiences: Experience[] };
      setItems(data.experiences ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const act = async (id: number, action: "approve" | "reject" | "delete") => {
    setBusy(id);
    try {
      await apiFetch("/api/admin/interviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const pending  = items.filter((i) => !i.approved);
  const approved = items.filter((i) => i.approved);

  const Table = ({ rows }: { rows: Experience[] }) => (
    <div className="overflow-auto -mx-5 -mb-5">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="sticky top-0 bg-surface-card">
          <tr>
            <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Company / Role</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Diff · Outcome</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Author</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Date</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((exp) => (
            <>
              <tr
                key={exp.id}
                className="cursor-pointer transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                onClick={() => setExpanded((e) => (e === exp.id ? null : exp.id))}
              >
                <td className="px-5 py-2.5">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{exp.company}</p>
                  <p className="text-xs text-zinc-500">{exp.role}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`mr-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${DIFF_COLOR[exp.difficulty]}`}>
                    {exp.difficulty.charAt(0).toUpperCase() + exp.difficulty.slice(1)}
                  </span>
                  <span className="text-xs text-zinc-500">{OUTCOME_LABEL[exp.outcome]}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {exp.anonymous ? <span className="italic text-zinc-400">Anonymous</span> : (exp.author_name ?? "—")}
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatDate(exp.created_at)}</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {!exp.approved ? (
                      <button
                        type="button"
                        disabled={busy === exp.id}
                        onClick={(e) => { e.stopPropagation(); void act(exp.id, "approve"); }}
                        className="rounded px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-emerald-950/40"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === exp.id}
                        onClick={(e) => { e.stopPropagation(); void act(exp.id, "reject"); }}
                        className="rounded px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-40 dark:hover:bg-amber-950/40"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy === exp.id}
                      onClick={(e) => { e.stopPropagation(); void act(exp.id, "delete"); }}
                      className="rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:bg-red-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              {/* Expanded detail */}
              {expanded === exp.id && (
                <tr key={`${exp.id}-body`}>
                  <td colSpan={5} className="bg-zinc-50 px-5 pb-4 pt-2 dark:bg-zinc-800/40">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Rounds</p>
                    <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{exp.rounds}</p>
                    {exp.tips && (
                      <>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Tips</p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{exp.tips}</p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
          {rows.length === 0 && <EmptyRow cols={5} text="None." />}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Pending review${pending.length > 0 ? ` (${pending.length})` : ""}`}
        description="New submissions waiting for approval before going public."
      >
        {loading ? <p className="py-6 text-center text-sm text-zinc-400">Loading…</p> : <Table rows={pending} />}
      </SectionCard>

      <SectionCard
        title={`Published (${approved.length})`}
        description="Approved experiences visible on /interviews."
      >
        {loading ? <p className="py-6 text-center text-sm text-zinc-400">Loading…</p> : <Table rows={approved} />}
      </SectionCard>
    </div>
  );
}
