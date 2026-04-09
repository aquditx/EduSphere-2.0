import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourses } from "@/hooks/useCourses.js";
import { useEnrollments } from "@/hooks/useProgress.js";
import { formatDuration } from "@/utils/index.js";

export default function StudentAssessmentsPage() {
  const enrollmentsQuery = useEnrollments();
  const coursesQuery = useCourses();

  const enrolledCourseIds = useMemo(
    () => new Set((Array.isArray(enrollmentsQuery.data) ? enrollmentsQuery.data : []).map((item) => item.courseId)),
    [enrollmentsQuery.data]
  );

  const enrolledCourses = useMemo(
    () => (Array.isArray(coursesQuery.data) ? coursesQuery.data : []).filter((course) => enrolledCourseIds.has(course.id)),
    [coursesQuery.data, enrolledCourseIds]
  );

  if (enrollmentsQuery.isLoading || coursesQuery.isLoading) {
    return (
      <PageShell title="AI quizzes" subtitle="Pick a lesson from your enrolled courses to test your knowledge.">
        <Spinner label="Loading quiz library" />
      </PageShell>
    );
  }

  if (enrollmentsQuery.isError) {
    return (
      <PageShell title="AI quizzes" subtitle="Pick a lesson from your enrolled courses to test your knowledge.">
        <ErrorState message={enrollmentsQuery.error.message} onAction={() => enrollmentsQuery.refetch()} />
      </PageShell>
    );
  }

  if (coursesQuery.isError) {
    return (
      <PageShell title="AI quizzes" subtitle="Pick a lesson from your enrolled courses to test your knowledge.">
        <ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} />
      </PageShell>
    );
  }

  if (!enrolledCourses.length) {
    return (
      <PageShell title="AI quizzes" subtitle="Pick a lesson from your enrolled courses to test your knowledge.">
        <EmptyState
          title="No quiz-ready courses yet"
          message="Enroll in a course first, then return here to choose lessons by module."
          action={
            <Link to="/courses" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              Browse courses
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="AI quizzes" subtitle="Choose a video lesson from your enrolled courses to take a quiz module-wise.">
      <div className="grid gap-8">
        {enrolledCourses.map((course) => (
          <section key={course.id} className="surface overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">{course.title}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{course.subtitle}</h2>
                <p className="mt-2 text-sm text-slate-500">{course.instructorName}</p>
              </div>
              <Link to={`/courses/${course.id}`} className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white">
                View course details
              </Link>
            </div>
            <div className="space-y-6 p-6">
              {(course.modules || []).map((module) => (
                <div key={module.id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{module.title}</p>
                      <p className="text-sm text-slate-500">{module.lessons.length} lessons</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Module</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/student/assessments/${course.id}/${lesson.id}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-900 transition hover:border-brand-500 hover:bg-brand-50"
                      >
                        <div>
                          <p>{lesson.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDuration(lesson.durationSeconds)}</p>
                        </div>
                        <span className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Quiz</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
