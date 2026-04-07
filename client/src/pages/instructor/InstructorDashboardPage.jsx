import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Button from "@/components/ui/Button.jsx";
import { useInstructorDashboard } from "@/hooks/useInstructorHooks.js";

export default function InstructorDashboardPage() {
  const dashboardQuery = useInstructorDashboard();

  if (dashboardQuery.isLoading) {
    return <PageShell title="Instructor dashboard" subtitle="Manage your catalog, revenue, and publishing health."><Spinner label="Loading instructor dashboard" /></PageShell>;
  }

  if (dashboardQuery.isError) {
    return <PageShell title="Instructor dashboard" subtitle="Manage your catalog, revenue, and publishing health."><ErrorState message={dashboardQuery.error.message} onAction={() => dashboardQuery.refetch()} /></PageShell>;
  }

  const { stats, courses, revenueSeries, notifications } = dashboardQuery.data;

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

      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Revenue trend</h2>
              <p className="mt-2 text-sm text-slate-500">Monitor your earnings momentum and course performance.</p>
            </div>
            <Link to="/instructor/revenue"><Button>View revenue</Button></Link>
          </div>
          <div className="mt-6 grid h-64 grid-cols-12 gap-2 items-end">
            {revenueSeries.map((value, index) => (
              <div key={index} className="col-span-1 rounded-t-3xl bg-slate-950" style={{ height: `${Math.max(20, value / 350)}px` }} />
            ))}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Course catalog</h2>
              <p className="mt-2 text-sm text-slate-500">Quick access to your highest-performing courses.</p>
            </div>
            <Link to="/instructor/create"><Button>New course</Button></Link>
          </div>
          <div className="mt-5 space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-950">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{course.status} • {course.enrollmentCount?.toLocaleString() || 0} learners</p>
                </div>
                <Link to={`/instructor/course/${course.id}/edit`} className="text-sm font-semibold text-brand-600">Edit</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Notifications</h2>
              <p className="mt-2 text-sm text-slate-500">Stay on top of reviews, student questions, and payouts.</p>
            </div>
            <Link to="/instructor/notifications"><Button variant="secondary">See all</Button></Link>
          </div>
          <div className="mt-5 space-y-4">
            {notifications?.slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-3xl border border-slate-200 px-5 py-4">
                <p className="font-medium text-slate-950">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-500">{notification.description}</p>
              </div>
            ))}
            {!notifications?.length && <p className="text-sm text-slate-500">No new notifications yet.</p>}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Quick links</h2>
              <p className="mt-2 text-sm text-slate-500">Jump to the tools you use most as an instructor.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link to="/instructor/courses" className="rounded-3xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-950 hover:bg-slate-50">Manage courses</Link>
            <Link to="/instructor/analytics" className="rounded-3xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-950 hover:bg-slate-50">View analytics</Link>
            <Link to="/instructor/revenue" className="rounded-3xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-950 hover:bg-slate-50">Revenue center</Link>
            <Link to="/instructor/settings" className="rounded-3xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-950 hover:bg-slate-50">Profile settings</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
