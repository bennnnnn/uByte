import Link from "next/link";

interface Stats {
  xp: number;
  streak_days: number;
  longest_streak: number;
  streak_freezes?: number;
  completed_count: number;
  total_tutorials: number;
  activity_count: number;
}

export default function StatsRow({ stats }: { stats: Stats }) {
  // When every meaningful stat is zero this is a brand-new user — show a gentle nudge
  // instead of a row of zeroes that could feel discouraging or confusing.
  const isNew = stats.xp === 0 && stats.completed_count === 0 && stats.activity_count === 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        <StatCard label="XP" value={stats.xp.toString()} icon="⭐" />
        <StatCard label="Streak" value={`${stats.streak_days}d`} icon="🔥" sub={`Best: ${stats.longest_streak}d`} />
        <StatCard label="Freezes" value={(stats.streak_freezes ?? 1).toString()} icon="🛡️" sub="streak shield" tooltip="Streak freeze: used automatically when you miss a day. Earn one every 7-day streak." />
        <StatCard label="Lessons" value={`${stats.completed_count}/${stats.total_tutorials}`} icon="✅" sub="across all 7 languages" />
        <StatCard label="Activities" value={stats.activity_count.toString()} icon="📊" />
      </div>

      {isNew && (
        <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Complete your first tutorial to start building your stats.{" "}
          <Link href="/tutorial/go" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Start now →
          </Link>
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, sub, tooltip }: { label: string; value: string; icon: string; sub?: string; tooltip?: string }) {
  return (
    <div className="relative rounded-xl border border-zinc-200 p-4 dark:border-zinc-800" title={tooltip}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      {sub && <p className="text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}
