import Logo from "@/components/branding/Logo.jsx";

export default function AuthPanel() {
  return (
    <div className="relative hidden overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.3),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.24),transparent_28%)]" />
      <div className="relative flex h-full flex-col justify-between">
        <Logo />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-200">EduSphere LMS</p>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">
            Build a focused learning experience with premium UX and modular systems.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Authentication flows, state management, and polished UI components are already structured for production.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["18k+", "active learners"],
            ["92%", "completion uplift"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold">{value}</div>
              <div className="mt-1 text-sm text-slate-300">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

