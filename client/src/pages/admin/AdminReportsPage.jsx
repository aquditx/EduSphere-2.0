import { PageShell } from "@/components/layout/PageShell.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useAdminDashboard } from "@/hooks/useUsers.js";

export default function AdminReportsPage() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isLoading) {
    return <PageShell title="Admin reports" subtitle="Track core marketplace and completion analytics."><Spinner label="Loading reports" /></PageShell>;
  }

  if (dashboardQuery.isError) {
    return <PageShell title="Admin reports" subtitle="Track core marketplace and completion analytics."><ErrorState message={dashboardQuery.error.message} onAction={() => dashboardQuery.refetch()} /></PageShell>;
  }

  const { analytics } = dashboardQuery.data;

  return (
    <PageShell title="Admin reports" subtitle="Track core marketplace and completion analytics.">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface p-6"><p className="text-sm text-slate-500">Active users</p><p className="mt-3 text-3xl font-semibold text-slate-950">{analytics.activeUsers}</p></div>
        <div className="surface p-6"><p className="text-sm text-slate-500">Completion rate</p><p className="mt-3 text-3xl font-semibold text-slate-950">{analytics.completionRate}%</p></div>
        <div className="surface p-6"><p className="text-sm text-slate-500">Published courses</p><p className="mt-3 text-3xl font-semibold text-slate-950">{analytics.publishedCourses}</p></div>
        <div className="surface p-6"><p className="text-sm text-slate-500">Latest revenue</p><p className="mt-3 text-3xl font-semibold text-slate-950">${analytics.revenueSeries[analytics.revenueSeries.length - 1].toLocaleString()}</p></div>
      </section>
      <section className="surface p-6">
        <h2 className="text-xl font-semibold text-slate-950">Monthly revenue</h2>
        <div className="mt-6 grid grid-cols-7 gap-4">
          {analytics.revenueSeries.map((value, index) => (
            <div key={index} className="rounded-[2rem] bg-slate-50 p-4 text-center">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">M{index + 1}</div>
              <div className="mt-3 text-lg font-semibold text-slate-950">${value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

