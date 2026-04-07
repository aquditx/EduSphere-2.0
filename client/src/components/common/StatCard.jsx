export default function StatCard({ label, value, detail }) {
  return (
    <div className="surface p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
        {detail ? <span className="text-sm font-medium text-emerald-600">{detail}</span> : null}
      </div>
    </div>
  );
}

