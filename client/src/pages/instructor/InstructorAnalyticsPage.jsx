import Badge from "@/components/common/Badge.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useInstructorAnalytics } from "@/hooks/useInstructorHooks.js";

function SummaryCard({ title, value, detail }) {
  return (
    <div className="surface p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function ChartBlock({ title, children }) {
  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function InstructorAnalyticsPage() {
  const analyticsQuery = useInstructorAnalytics();

  if (analyticsQuery.isLoading) {
    return (
      <PageShell title="Instructor analytics" subtitle="Track enrollments, revenue, retention, and review performance.">
        <Spinner label="Loading analytics" />
      </PageShell>
    );
  }

  if (analyticsQuery.isError) {
    return (
      <PageShell title="Instructor analytics" subtitle="Track enrollments, revenue, retention, and review performance.">
        <ErrorState message={analyticsQuery.error.message} onAction={() => analyticsQuery.refetch()} />
      </PageShell>
    );
  }

  const { revenueSummary, revenueByCourse, revenueOverTime, learnerStats, reviewStats, payoutHistory } = analyticsQuery.data;

  if (!revenueSummary) {
    return (
      <PageShell title="Instructor analytics" subtitle="Track enrollments, revenue, retention, and review performance.">
        <EmptyState title="No analytics yet" message="Start publishing courses to see your instructor analytics." action={<Badge className="bg-slate-950 text-white">Waiting for activity</Badge>} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Instructor analytics" subtitle="Track enrollments, revenue, retention, and review performance.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Lifetime revenue" value={revenueSummary.lifetimeRevenue} detail="All-time instructor earnings" />
        <SummaryCard title="This month" value={revenueSummary.currentMonth} detail="Revenue earned this month" />
        <SummaryCard title="New learners" value={learnerStats.newThisWeek} detail="Joined in the last 7 days" />
        <SummaryCard title="Active learners" value={learnerStats.activeThisWeek} detail="Active in the last 7 days" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartBlock title="Revenue over time">
          <div className="space-y-3">
            {revenueOverTime.map((point) => (
              <div key={point.label} className="flex items-center gap-4">
                <span className="w-28 text-sm text-slate-500">{point.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.min(100, Math.round((point.amount / revenueSummary.maxRevenue) * 100))}%` }} />
                </div>
                <span className="w-24 text-right text-sm text-slate-700">{point.amount}</span>
              </div>
            ))}
          </div>
        </ChartBlock>

        <ChartBlock title="Revenue by course">
          <div className="space-y-4">
            {revenueByCourse.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{course.title}</span>
                  <span>{course.revenue}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-950" style={{ width: `${course.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartBlock>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Learner insights</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Top countries</p>
              <span className="text-sm font-semibold text-slate-950">{learnerStats.topCountries.join(", ")}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Device mix</p>
              <span className="text-sm font-semibold text-slate-950">{learnerStats.deviceBreakdown.desktop}% desktop</span>
            </div>
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Review performance</h2>
          <div className="mt-5 space-y-3">
            {reviewStats.distribution.map((bucket) => (
              <div key={bucket.rating} className="flex items-center gap-4 text-sm">
                <span className="w-14 text-slate-600">{bucket.rating}★</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-950" style={{ width: `${bucket.share}%` }} />
                </div>
                <span className="w-12 text-right text-slate-700">{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">Latest reviews</h2>
          <Badge className="bg-slate-100 text-slate-700">{reviewStats.latest.length} new</Badge>
        </div>
        <div className="mt-6 space-y-4">
          {reviewStats.latest.map((review) => (
            <div key={review.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{review.studentName}</p>
                  <p className="text-sm text-slate-500">{review.courseTitle}</p>
                </div>
                <Badge>{review.rating}★</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
