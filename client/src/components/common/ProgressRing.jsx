export default function ProgressRing({ progress }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="-rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} strokeWidth="10" className="fill-none stroke-slate-200" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none stroke-brand-600 transition-all duration-500"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-semibold text-slate-950">{progress}%</div>
        <div className="text-xs text-slate-500">completed</div>
      </div>
    </div>
  );
}

