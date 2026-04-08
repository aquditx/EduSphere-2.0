import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 transition hover:opacity-80">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
        NL
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">EduSphere</p>
        <p className="text-sm text-slate-500">Learning OS</p>
      </div>
    </Link>
  );
}