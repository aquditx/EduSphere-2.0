import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import ProgressBar from "@/components/player/ProgressBar.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import { useStudentDashboard } from "@/hooks/useUsers.js";
import { formatMinutes } from "@/utils/index.js";

export default function StudentDashboardPage() {
  const dashboardQuery = useStudentDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <PageShell title="Dashboard" subtitle="Track progress, resume lessons, and stay on top of outcomes.">
        <Spinner label="Loading your dashboard" />
      </PageShell>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <PageShell title="Dashboard" subtitle="Track progress, resume lessons, and stay on top of outcomes.">
        <ErrorState message={dashboardQuery.error.message} onAction={() => dashboardQuery.refetch()} />
      </PageShell>
    );
  }

  const { heroCourse, continueLearning, stats, activity } = dashboardQuery.data;

  return (
    <PageShell title="Dashboard" subtitle="Track progress, resume lessons, and stay on top of outcomes.">
      {heroCourse ? (
        <section className="surface overflow-hidden">
          <div className={`grid gap-8 bg-gradient-to-br ${heroCourse.accent} p-8 text-white lg:grid-cols-[1.2fr_0.8fr] lg:p-10`}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Continue learning</p>
              <h2 className="mt-4 text-4xl font-semibold">{heroCourse.title}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{heroCourse.description}</p>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/85">
                <span>{heroCourse.totalLessons} lessons</span>
                <span>{formatMinutes(heroCourse.durationMinutes)}</span>
                <span>{heroCourse.instructorName}</span>
              </div>
              <Link to={`/learn/${heroCourse.id}/${heroCourse.resumeLessonId}`} className="mt-8 inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
                Resume course
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-xs rounded-[2rem] bg-white/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-white/70">Progress</div>
                <div className="mt-3 text-5xl font-semibold">{heroCourse.progressPercent}%</div>
                <div className="mt-4"><ProgressBar value={heroCourse.progressPercent} /></div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No active courses yet"
          message="Browse the catalog and enroll to start building your dashboard."
          action={
            <Link to="/courses" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              Explore courses
            </Link>
          }
        />
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface p-6">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Continue learning</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Pick up where you left off</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {continueLearning.map((course) => (
              <article key={course.id} className="surface overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{course.instructorName}</p>
                  <div className="mt-4"><ProgressBar value={course.progressPercent} /></div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{course.progressPercent}% complete</span>
                    <Link to={`/learn/${course.id}/${course.resumeLessonId}`} className="font-semibold text-brand-600">Resume</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
