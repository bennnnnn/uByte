/**
 * RevenueTab — income overview, bar chart, and subscription event log.
 *
 * Sections:
 *   1. Four stat cards (today / week / month / year).
 *   2. Revenue bar chart for the selected period.
 *   3. Recent subscription events table.
 */

import { StatCard, SectionCard, EmptyRow } from "../components";
import { formatDate, formatCents } from "../utils";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function RevenueTab({ data }: Props) {
  const { revenue, revenueSeries, subscriptionEvents, mrr } = data;

  if (!revenue) return null;

  return (
    <div className="space-y-5">

      {/* ── Top-line stat cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Today" value={formatCents(revenue.revenueToday)} />
        <StatCard label="This week" value={formatCents(revenue.revenueThisWeek ?? 0)} />
        <StatCard label="This month" value={formatCents(revenue.revenueThisMonth)} />
        <StatCard label="This year" value={formatCents(revenue.revenueThisYear ?? 0)} />
      </div>

      {/* ── Bar chart ─────────────────────────────────────────────────── */}
      <SectionCard title="Revenue chart">
        {revenueSeries.length > 0 ? (
          <>
            <div className="flex h-40 items-end gap-0.5">
              {revenueSeries.map((d) => {
                const maxR = Math.max(...revenueSeries.map((x) => x.revenue), 1);
                const h = (d.revenue / maxR) * 100;
                return (
                  <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end" title={d.date + ": " + formatCents(d.revenue)}>
                    <div className="w-full rounded-t bg-indigo-500 transition-all group-hover:bg-indigo-400 dark:bg-indigo-600" style={{ height: Math.max(h, d.revenue > 0 ? 4 : 1) + "%" }} />
                    <div className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-white group-hover:block">
                      {"$" + (d.revenue / 100).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Est. MRR: {formatCents(Math.round(mrr))} · Pro: {revenue.proSubscribers} · Monthly: {revenue.monthlySubscribers} · Yearly: {revenue.yearlySubscribers}
            </p>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-zinc-400">No revenue data for this period.</p>
        )}
      </SectionCard>

      {/* ── Subscription events ────────────────────────────────────────── */}
      <SectionCard title="Recent subscription events">
        <div className="overflow-auto -mx-5 -mb-5">
          <table className="w-full min-w-[540px] text-sm">
            <thead className="sticky top-0 bg-surface-card">
              <tr>
                <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">When</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">User</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Plan</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Amount</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {subscriptionEvents.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="px-5 py-2.5 text-xs text-zinc-500">{formatDate(e.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-zinc-900 dark:text-zinc-100">{e.user_name ?? "—"}</span>
                    {e.user_email && <span className="ml-1.5 text-xs text-zinc-400">{e.user_email}</span>}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{e.plan}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatCents(e.amount_cents)}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-zinc-500">{e.event_type}</td>
                </tr>
              ))}
              {subscriptionEvents.length === 0 && <EmptyRow cols={5} text="No events yet." />}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
