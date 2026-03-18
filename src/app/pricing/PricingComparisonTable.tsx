interface Row {
  name: string;
  free: string;
  pro: string;
}

interface Props {
  rows: Row[];
}

export default function PricingComparisonTable({ rows }: Props) {
  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <h2 className="mb-6 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Compare plans
      </h2>
      {/* overflow-x-auto lets the table scroll horizontally on narrow phones */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="px-5 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Feature</th>
              <th className="px-5 py-3 text-center font-semibold text-zinc-500 dark:text-zinc-400">Free</th>
              <th className="px-5 py-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">Pro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.name}
                className={i < rows.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}
              >
                <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">{row.name}</td>
                <td className="px-5 py-3 text-center text-zinc-500 dark:text-zinc-400">{row.free}</td>
                <td className="px-5 py-3 text-center font-medium text-zinc-900 dark:text-zinc-100">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
