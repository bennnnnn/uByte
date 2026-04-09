/**
 * GrowthTab — conversion funnel, signup trend, and churn signals.
 *
 * Data comes from GET /api/admin/stats?view=growth (requires `growth` permission)
 * so sub-admins never need the full user list in the browser.
 */

import { useMemo } from "react";
import { StatCard, SectionCard } from "../components";
import type { AdminData } from "../hooks";
import type { AdminGrowthSnapshot } from "@/lib/db/types";
import { formatAdminPlanLabel } from "../plan-labels";

interface Props {
  data: AdminData;
}

export default function GrowthTab({ data }: Props) {
  const { growthSnapshot, hasPermission } = data;

  const funnel = useMemo(() => {
    if (!growthSnapshot) {
      return [
        { label: "Signed up", count: 0, pct: 100, color: "bg-indigo-500" },
        { label: "Activated", count: 0, pct: 0, color: "bg-indigo-400" },
        { label: "Engaged (5+ lessons)", count: 0, pct: 0, color: "bg-violet-500" },
        { label: "Pro subscriber", count: 0, pct: 0, color: "bg-emerald-500" },
      ];
    }
    const total = growthSnapshot.total_users;
    const activated = growthSnapshot.activated;
    const engaged = growthSnapshot.engaged_5plus;
    const pro = growthSnapshot.pro_subscribers;
    return [
      { label: "Signed up", count: total, pct: 100, color: "bg-indigo-500" },
      { label: "Activated", count: activated, pct: total > 0 ? Math.round((activated / total) * 100) : 0, color: "bg-indigo-400" },
      { label: "Engaged (5+ lessons)", count: engaged, pct: total > 0 ? Math.round((engaged / total) * 100) : 0, color: "bg-violet-500" },
      { label: "Pro subscriber", count: pro, pct: total > 0 ? Math.round((pro / total) * 100) : 0, color: "bg-emerald-500" },
    ];
  }, [growthSnapshot]);

  const signupSeries = growthSnapshot?.signup_by_day ?? [];
  const maxBar = Math.max(...signupSeries.map((d) => d.count), 1);

  const churn = growthSnapshot
    ? {
        neverStarted: growthSnapshot.never_started_count,
        wentCold: growthSnapshot.went_cold_count,
        atRiskPro: growthSnapshot.at_risk_pro_count,
        neverStartedSample: growthSnapshot.never_started_sample,
      }
    : { neverStarted: 0, wentCold: 0, atRiskPro: 0, neverStartedSample: [] as AdminGrowthSnapshot["never_started_sample"] };

  if (hasPermission("growth") && !growthSnapshot) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Growth metrics could not be loaded. Refresh the page or check your network connection.
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Top-line growth cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total users" value={String(growthSnapshot?.total_users ?? 0)} />
        <StatCard label="Activated" value={String(funnel[1].count)} sub={funnel[1].pct + "% of signups"} />
        <StatCard label="Pro subscribers" value={String(funnel[3].count)} sub={funnel[3].pct + "% conversion"} />
        <StatCard label="Never started" value={String(churn.neverStarted)} sub="signed up, 0 XP" />
      </div>

      {/* ── Conversion funnel ─────────────────────────────────────────────── */}
      <SectionCard title="Conversion funnel" description="From signup to paid subscriber.">
        <div className="space-y-3">
          {funnel.map((step) => (
            <div key={step.label} className="flex items-center gap-2 sm:gap-4">
              <span className="w-24 shrink-0 text-xs sm:w-40 sm:text-sm text-zinc-600 dark:text-zinc-400">{step.label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-3 rounded-full transition-all ${step.color}`}
                  style={{ width: Math.max(step.pct, step.count > 0 ? 2 : 0) + "%" }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-xs font-semibold sm:w-24 sm:text-sm text-zinc-900 dark:text-zinc-100">
                {step.count.toLocaleString()} <span className="font-normal text-zinc-400">({step.pct}%)</span>
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
          <span>{signupSeries[0]?.date.slice(5) ?? "—"}</span>
          <span>today</span>
        </div>
      </SectionCard>

      {/* ── Churn signals ─────────────────────────────────────────────────── */}
      <SectionCard title="Churn signals" description="Users who may need re-engagement.">
        <div className="grid gap-3 sm:grid-cols-3">
          <ChurnCard
            label="Never started"
            count={churn.neverStarted}
            description="Signed up 3+ days ago, 0 XP earned"
            color="amber"
          />
          <ChurnCard
            label="Went cold"
            count={churn.wentCold}
            description="Had progress, inactive 14+ days"
            color="orange"
          />
          <ChurnCard
            label="At-risk Pro"
            count={churn.atRiskPro}
            description="Pro subscriber, inactive 7+ days"
            color="red"
          />
        </div>

        {churn.neverStartedSample.length > 0 && (
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
                  {churn.neverStartedSample.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{u.name}</td>
                      <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">{u.email}</td>
                      <td className="py-2 pr-4 text-right text-zinc-400">{u.created_at?.slice(0, 10)}</td>
                      <td className="py-2 text-right">
                        <span
                          title={formatAdminPlanLabel(u.plan)}
                          className="inline-block max-w-[10rem] truncate rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {formatAdminPlanLabel(u.plan)}
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
    orange: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400",
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
  const alignCls = align === "left" ? "text-left" : "text-right";
  return (
    <th className={`${last ? "pr-0" : "pr-4"} py-2 ${alignCls} text-xs font-semibold uppercase tracking-wide text-zinc-400`}>
      {children}
    </th>
  );
}
