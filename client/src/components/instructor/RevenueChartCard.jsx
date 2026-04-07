const bars = [48, 72, 56, 88, 62, 95, 78];

export default function RevenueChartCard() {
  return (
    <div className="surface p-6">
      <h3 className="text-lg font-semibold text-slate-950">Revenue trend</h3>
      <div className="mt-8 flex h-56 items-end justify-between gap-3">
        {bars.map((bar, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-3">
            <div
              className="w-full rounded-t-[1.25rem] bg-gradient-to-t from-slate-950 via-brand-600 to-cyan-400"
              style={{ height: `${bar}%` }}
            />
            <span className="text-xs font-medium text-slate-400">W{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

