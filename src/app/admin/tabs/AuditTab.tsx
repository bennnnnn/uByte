/**
 * AuditTab — chronological log of admin actions.
 *
 * Shows a read-only table of every admin action (ban, delete, promote,
 * plan change, etc.) with the admin who performed it, the target user,
 * and a timestamp.
 */

import { SectionCard, EmptyRow } from "../components";
import { formatDate } from "../utils";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function AuditTab({ data }: Props) {
  const { auditLog } = data;

  return (
    <SectionCard title="Admin action log">
      <div className="overflow-auto -mx-5 -mb-5">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Action</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Admin</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Target</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {auditLog.map((entry) => (
              <tr key={entry.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                <td className="px-5 py-2.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">{entry.action}</td>
                <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{entry.admin_name ?? "—"}</td>
                <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{entry.target_name ?? "—"}</td>
                <td className="px-5 py-2.5 text-right text-xs text-zinc-400">{formatDate(entry.created_at)}</td>
              </tr>
            ))}
            {auditLog.length === 0 && <EmptyRow cols={4} text="No admin actions yet." />}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
