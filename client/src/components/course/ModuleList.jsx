export default function ModuleList({ modules }) {
  return (
    <div className="surface p-6">
      <h3 className="text-lg font-semibold text-slate-950">Course modules</h3>
      <div className="mt-6 space-y-3">
        {modules.map((module, index) => (
          <div key={module.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Module {index + 1}</p>
              <p className="mt-1 font-medium text-slate-950">{module.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{module.duration}</p>
              <p className={`mt-1 text-sm font-medium ${module.completed ? "text-emerald-600" : "text-brand-600"}`}>
                {module.completed ? "Completed" : "In progress"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

