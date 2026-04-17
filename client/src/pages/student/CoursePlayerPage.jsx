import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CourseSidebar from "@/components/course/CourseSidebar.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import ProgressBar from "@/components/player/ProgressBar.jsx";
import VideoPlayer from "@/components/player/VideoPlayer.jsx";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourse } from "@/hooks/useCourses.js";
import { useCourseProgress, useEnrollments, useMarkLessonComplete, useSaveWatchTime } from "@/hooks/useProgress.js";
import { usePlayerStore } from "@/store/playerStore.js";

export default function CoursePlayerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const courseQuery = useCourse(courseId);
  const enrollmentsQuery = useEnrollments();
  const progressQuery = useCourseProgress(courseId);
  const markCompleteMutation = useMarkLessonComplete(courseId);
  const watchTimeMutation = useSaveWatchTime(courseId);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const captionsEnabled = usePlayerStore((state) => state.captionsEnabled);
  const setPlaybackRate = usePlayerStore((state) => state.setPlaybackRate);
  const setCaptionsEnabled = usePlayerStore((state) => state.setCaptionsEnabled);
  const setLessonId = usePlayerStore((state) => state.setLessonId);
  const [watchedTime, setWatchedTime] = useState(0);

  const course = courseQuery.data;
  const progress = progressQuery.data;
  const isEnrolled = enrollmentsQuery.data?.some((item) => item.courseId === courseId);

  useEffect(() => {
    if (lessonId) {
      setLessonId(lessonId);
    }
  }, [lessonId, setLessonId]);

  useEffect(() => {
    return () => {
      if (watchedTime > 0 && isEnrolled) {
        watchTimeMutation.mutate({ lessonId, timeWatched: watchedTime });
      }
    };
  }, [watchedTime, isEnrolled, lessonId]);

  const lesson = useMemo(() => course?.lessons.find((item) => item.id === lessonId) || course?.lessons[0], [course, lessonId]);
  const lessonIndex = course?.lessons.findIndex((item) => item.id === lesson?.id) ?? -1;
  const nextLesson = lessonIndex >= 0 ? course?.lessons[lessonIndex + 1] : null;
  const progressPercent = course && progress
    ? Math.round(((progress?.completedLessonIds?.length || 0) / (course.totalLessons || 1)) * 100)
    : 0;

  async function handleMarkComplete() {
    if (!lesson || !isEnrolled) {
      return;
    }
    await markCompleteMutation.mutateAsync({ lessonId: lesson.id, nextLessonId: nextLesson?.id, timeWatched: watchedTime });
    if (nextLesson) {
      navigate(`/learn/${course.id}/${nextLesson.id}`);
    }
  }

  if (courseQuery.isLoading || enrollmentsQuery.isLoading || progressQuery.isLoading) {
    return (
      <PageShell title="Course player" subtitle="Stream lessons, track progression, and move through a focused learning flow." fullWidth>
        <Spinner label="Loading lesson player" />
      </PageShell>
    );
  }

  if (courseQuery.isError || progressQuery.isError) {
    return (
      <PageShell title="Course player" subtitle="Stream lessons, track progression, and move through a focused learning flow." fullWidth>
        <ErrorState message={courseQuery.error?.message || progressQuery.error?.message} onAction={() => { courseQuery.refetch(); progressQuery.refetch(); }} />
      </PageShell>
    );
  }

  if (!isEnrolled) {
    return (
      <PageShell title="Course player" subtitle="Enroll to unlock the full lesson experience." fullWidth>
        <ErrorState title="Enrollment required" message="This player is enrollment-aware. Enroll from the course details page to access locked lessons and save progress." actionLabel="Back to course" onAction={() => navigate(`/courses/${course.id}`)} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Course player" subtitle="Stream lessons, track progression, and move through a focused learning flow." fullWidth>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <VideoPlayer
            lesson={lesson}
            playbackRate={playbackRate}
            captionsEnabled={captionsEnabled}
            onPlaybackRateChange={setPlaybackRate}
            onCaptionsToggle={() => setCaptionsEnabled(!captionsEnabled)}
            onTimeUpdate={(time) => setWatchedTime(time)}
          />
          <section className="surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Currently watching</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{lesson.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.description}</p>
              </div>
              <Button onClick={handleMarkComplete} disabled={markCompleteMutation.isPending}>
                {markCompleteMutation.isPending ? "Saving..." : nextLesson ? "Mark complete & next" : "Mark complete"}
              </Button>
            </div>
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                <span>Course progress</span>
                <span>{progressPercent}%</span>
              </div>
              <ProgressBar value={progressPercent} />
            </div>
            <div className="mt-6 flex gap-4 text-sm">
              {nextLesson ? <Link to={`/learn/${course.id}/${nextLesson.id}`} className="font-semibold text-brand-600">Skip to next lesson</Link> : <span className="text-slate-500">Last lesson in course</span>}
              <Link to={`/courses/${course.id}`} className="font-semibold text-slate-700">Back to course</Link>
            </div>
          </section>
        </div>
        <CourseSidebar course={course} activeLessonId={lesson.id} progress={progress} isEnrolled={isEnrolled} />
      </div>
    </PageShell>
  );
}

