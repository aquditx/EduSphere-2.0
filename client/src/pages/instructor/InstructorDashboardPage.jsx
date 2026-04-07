import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import { useInstructorDashboard } from "@/hooks/useUsers.js";

export default function InstructorDashboardPage() {
  const dashboardQuery = useInstructorDashboard();

  if (dashboardQuery.isLoading) {
    return <PageShell title="Instructor dashboard" subtitle="Manage your catalog, revenue, and publishing health."><Spinner label="Loading instructor dashboard" /></PageShell>;
  }

  if (dashboardQuery.isError) {
    return <PageShell title="Instructor dashboard" subtitle="Manage your catalog, revenue, and publishing health."><ErrorState message={dashboardQuery.error.message} onAction={() => dashboardQuery.refetch()} /></PageShell>;
  }

  const { stats, courses, revenueSeries } = dashboardQuery.data;

  return (
    <PageShell title="Instructor dashboard" subtitle="Manage your catalog, revenue, and publishing health.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface p-6">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Revenue trend</h2>
          <div className="mt-6 flex h-64 items-end gap-3">
            {revenueSeries.map((value, index) => (
              <div key={index} className="flex-1 rounded-t-3xl bg-slate-950/90" style={{ height: `${Math.max(15, value / 300)}px` }} />
            ))}
          </div>
        </div>
        <div className="surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Catalog</h2>
              <p className="mt-2 text-sm text-slate-500">Edit, review, and monitor your courses.</p>
            </div>
            <Link to="/instructor/create" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              Create course
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-950">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{course.status} • {course.totalLessons} lessons</p>
                </div>
                <Link to={`/instructor/course/${course.id}/edit`} className="text-sm font-semibold text-brand-600">Edit</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
