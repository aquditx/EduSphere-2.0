export default function ActivityList({ items }) {
  return (
    <div className="surface p-6">
      <h3 className="text-lg font-semibold text-slate-950">Recent activity</h3>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

