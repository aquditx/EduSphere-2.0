import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import LessonQuiz from "@/components/player/LessonQuiz.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourse } from "@/hooks/useCourses.js";
import { useCourseProgress, useSubmitQuiz } from "@/hooks/useProgress.js";
import { formatDuration } from "@/utils/index.js";

export default function StudentAssessmentLessonPage() {
  const { courseId, lessonId } = useParams();
  const courseQuery = useCourse(courseId);
  const progressQuery = useCourseProgress(courseId);
  const quizMutation = useSubmitQuiz(courseId);

  if (courseQuery.isLoading || progressQuery.isLoading) {
    return (
      <PageShell title="Lesson quiz" subtitle="Loading your quiz lesson..." fullWidth>
        <Spinner label="Loading quiz details" />
      </PageShell>
    );
  }

  if (courseQuery.isError) {
    return (
      <PageShell title="Lesson quiz" subtitle="Loading your quiz lesson..." fullWidth>
        <ErrorState message={courseQuery.error.message} onAction={() => courseQuery.refetch()} />
      </PageShell>
    );
  }

  const course = courseQuery.data;
  const lesson = course?.lessons.find((item) => item.id === lessonId);
  const module = useMemo(
    () => course?.modules.find((item) => item.lessons.some((lessonItem) => lessonItem.id === lessonId)),
    [course, lessonId]
  );

  if (!lesson) {
    return (
      <PageShell title="Lesson quiz" subtitle="Lesson not found" fullWidth>
        <ErrorState title="Quiz lesson missing" message="The lesson could not be found for this course." actionLabel="Back to quizzes" onAction={() => window.history.back()} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Lesson quiz" subtitle={`Take a quiz for ${lesson.title}`} fullWidth>
      <div className="grid gap-8 xl:grid-cols-[1.1fr_420px]">
        <section className="space-y-6">
          <div className="surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">{course.title}</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">{lesson.title}</h1>
                <p className="mt-3 text-sm text-slate-500">{module?.title || "Lesson"} · {formatDuration(lesson.durationSeconds)}</p>
              </div>
              <Link to="/student/assessments" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                Back to quiz library
              </Link>
            </div>
          </div>
          <LessonQuiz
            lesson={lesson}
            previousResult={progressQuery.data?.quizResults?.[lesson.id]}
            onSubmit={({ answers, score }) => quizMutation.mutateAsync({ lessonId: lesson.id, answers, score })}
            isPending={quizMutation.isPending}
          />
        </section>
        <aside className="space-y-4">
          <div className="surface p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Quiz guidance</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">Answer the questions based on the lesson content. Your score will be saved with your progress and shown on the course review page.</p>
          </div>
          <div className="surface p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Lesson details</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>{course.modules.length} modules in this course</p>
              <p>{course.totalLessons} total lessons</p>
              <p>{course.level} level</p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
