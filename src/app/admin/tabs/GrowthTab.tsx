/**
 * GrowthTab — conversion funnel, signup trend, and churn signals.
 *
 * All metrics are derived client-side from the already-fetched users array,
 * so no extra API endpoints are needed. When team analytics are added, wire
 * in a separate `teamStats` prop and render a TeamsSection below.
 */

import { useMemo } from "react";
import { StatCard, SectionCard } from "../components";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function GrowthTab({ data }: Props) {
  const { users } = data;

  /* ── Conversion funnel ─────────────────────────────────────────────────── */
  const funnel = useMemo(() => {
    const total      = users.length;
    const activated  = users.filter((u) => u.xp > 0 || u.completed_count > 0).length;
    const engaged    = users.filter((u) => u.completed_count >= 5).length;
    const pro        = users.filter((u) => u.plan && u.plan !== "free").length;

    return [
      { label: "Signed up",      count: total,      pct: 100,                                          color: "bg-indigo-500" },
      { label: "Activated",      count: activated,  pct: total > 0 ? Math.round(activated / total * 100) : 0, color: "bg-indigo-400" },
      { label: "Engaged (5+ lessons)", count: engaged, pct: total > 0 ? Math.round(engaged / total * 100) : 0,  color: "bg-violet-500" },
      { label: "Pro subscriber", count: pro,         pct: total > 0 ? Math.round(pro / total * 100) : 0,      color: "bg-emerald-500" },
    ];
  }, [users]);

  /* ── Daily signup trend (last 30 days) ─────────────────────────────────── */
  const signupSeries = useMemo(() => {
    const today = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    const dateMap = new Map(days.map((d) => [d.date, d]));
    for (const u of users) {
      const day = u.created_at?.slice(0, 10);
      if (day && dateMap.has(day)) { const entry = dateMap.get(day); if (entry) entry.count++; }
    }
    return days;
  }, [users]);

  /* ── Churn signals ──────────────────────────────────────────────────────── */
  const churn = useMemo(() => {
    const cutoff14   = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const cutoff7    = Date.now() -  7 * 24 * 60 * 60 * 1000;

    const neverStarted = users.filter((u) => {
      const age = Date.now() - new Date(u.created_at).getTime();
      return age > 3 * 24 * 60 * 60 * 1000 && u.xp === 0 && u.completed_count === 0;
    });

    const wentCold = users.filter((u) => {
      if (u.completed_count === 0) return false;
      const lastActive = u.last_active_at ? new Date(u.last_active_at).getTime() : new Date(u.created_at).getTime();
      return lastActive < cutoff14;
    });

    const atRiskPro = users.filter((u) => {
      if (u.plan === "free" || !u.plan) return false;
      const lastActive = u.last_active_at ? new Date(u.last_active_at).getTime() : new Date(u.created_at).getTime();
      return lastActive < cutoff7;
    });

    return { neverStarted, wentCold, atRiskPro };
  }, [users]);

  const maxBar = Math.max(...signupSeries.map((d) => d.count), 1);

  return (
    <div className="space-y-5">

      {/* ── Top-line growth cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total users"    value={String(users.length)} />
        <StatCard label="Activated"      value={String(funnel[1].count)} sub={funnel[1].pct + "% of signups"} />
        <StatCard label="Pro subscribers" value={String(funnel[3].count)} sub={funnel[3].pct + "% conversion"} />
        <StatCard label="Never started"  value={String(churn.neverStarted.length)} sub="signed up, 0 XP" />
      </div>

      {/* ── Conversion funnel ─────────────────────────────────────────────── */}
      <SectionCard title="Conversion funnel" description="From signup to paid subscriber.">
        <div className="space-y-3">
          {funnel.map((step) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="w-40 shrink-0 text-sm text-zinc-600 dark:text-zinc-400">{step.label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-3 rounded-full transition-all ${step.color}`}
                  style={{ width: Math.max(step.pct, step.count > 0 ? 2 : 0) + "%" }}
                />
              </div>
              <span className="w-24 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {step.count.toLocaleString()} <span className="text-xs font-normal text-zinc-400">({step.pct}%)</span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Daily signup trend ─────────────────────────────────────────────── */}
      <SectionCard title="Signups — last 30 days">
        <div className="flex h-28 items-end gap-px">
          {signupSeries.map((d) => {
            const h = (d.count / maxBar) * 100;
            return (
              <div
                key={d.date}
                className="group relative flex flex-1 flex-col items-center justify-end"
                title={`${d.date}: ${d.count} signup${d.count !== 1 ? "s" : ""}`}
              >
                <div
                  className="w-full rounded-t bg-indigo-500 transition-all group-hover:bg-indigo-400"
                  style={{ height: Math.max(h, d.count > 0 ? 4 : 1) + "%" }}
                />
                <div className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-white group-hover:block">
                  {d.date.slice(5)}: {d.count}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
          <span>{signupSeries[0]?.date.slice(5)}</span>
          <span>today</span>
        </div>
      </SectionCard>

      {/* ── Churn signals ─────────────────────────────────────────────────── */}
      <SectionCard title="Churn signals" description="Users who may need re-engagement.">
        <div className="grid gap-3 sm:grid-cols-3">
          <ChurnCard
            label="Never started"
            count={churn.neverStarted.length}
            description="Signed up 3+ days ago, 0 XP earned"
            color="amber"
          />
          <ChurnCard
            label="Went cold"
            count={churn.wentCold.length}
            description="Had progress, inactive 14+ days"
            color="orange"
          />
          <ChurnCard
            label="At-risk Pro"
            count={churn.atRiskPro.length}
            description="Pro subscriber, inactive 7+ days"
            color="red"
          />
        </div>

        {/* Top never-started users (to target for re-engagement) */}
        {churn.neverStarted.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Never-started sample (newest first)</p>
            <div className="overflow-auto">
              <table className="w-full min-w-[360px] text-sm">
                <thead>
                  <tr>
                    <Th align="left">Name</Th>
                    <Th align="left">Email</Th>
                    <Th>Joined</Th>
                    <Th last>Plan</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {churn.neverStarted.slice(0, 10).map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{u.name}</td>
                      <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">{u.email}</td>
                      <td className="py-2 pr-4 text-right text-zinc-400">{u.created_at?.slice(0, 10)}</td>
                      <td className="py-2 text-right">
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {u.plan || "free"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Teams placeholder ──────────────────────────────────────────────── */}
      <SectionCard title="Team & company plans" description="Coming soon — multi-seat billing and team progress dashboards.">
        <div className="flex items-start gap-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-5 dark:border-zinc-700 dark:bg-zinc-800/30">
          <span className="text-2xl">🏢</span>
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">Team analytics will live here</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              When team plans ship, this section will show per-team progress, seat usage, and billing overview.
              The data model is designed for it — just add a <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">team_id</code> foreign key and a teams table.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ── Churn signal card ───────────────────────────────────────────────────── */
function ChurnCard({ label, count, description, color }: {
  label: string;
  count: number;
  description: string;
  color: "amber" | "orange" | "red";
}) {
  const colorMap = {
    amber:  "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400",
    orange: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400",
    red:    "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="mt-0.5 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs opacity-75">{description}</p>
    </div>
  );
}

/* ── Table header ────────────────────────────────────────────────────────── */
function Th({ children, align = "right", last }: { children: React.ReactNode; align?: "left" | "right"; last?: boolean }) {
  return (
    <th className={`${last ? "pr-0" : "pr-4"} py-2 text-${align} text-xs font-semibold uppercase tracking-wide text-zinc-400`}>
      {children}
    </th>
  );
}
