import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useAdminDashboard } from "@/hooks/useUsers.js";

export default function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isLoading) {
    return <PageShell title="Admin dashboard" subtitle="Oversee users, approvals, and platform analytics."><Spinner label="Loading admin dashboard" /></PageShell>;
  }

  if (dashboardQuery.isError) {
    return <PageShell title="Admin dashboard" subtitle="Oversee users, approvals, and platform analytics."><ErrorState message={dashboardQuery.error.message} onAction={() => dashboardQuery.refetch()} /></PageShell>;
  }

  const { stats, analytics } = dashboardQuery.data;

  return (
    <PageShell title="Admin dashboard" subtitle="Oversee users, approvals, and platform analytics.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface p-6">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Revenue trend</h2>
          <div className="mt-6 flex h-64 items-end gap-3">
            {analytics.revenueSeries.map((value, index) => (
              <div key={index} className="flex-1 rounded-t-3xl bg-slate-950/90" style={{ height: `${Math.max(15, value / 300)}px` }} />
            ))}
          </div>
        </div>
        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Admin actions</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Link to="/admin/users" className="block rounded-2xl border border-slate-200 px-4 py-4 font-medium text-slate-900">Manage users</Link>
            <Link to="/admin/courses" className="block rounded-2xl border border-slate-200 px-4 py-4 font-medium text-slate-900">Approve courses</Link>
            <Link to="/admin/reports" className="block rounded-2xl border border-slate-200 px-4 py-4 font-medium text-slate-900">Inspect analytics</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

