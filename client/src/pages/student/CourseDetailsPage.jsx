import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CourseHero from "@/components/course/CourseHero.jsx";
import ModuleAccordion from "@/components/course/ModuleAccordion.jsx";
import ReviewList from "@/components/course/ReviewList.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import Button from "@/components/ui/Button.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Input from "@/components/ui/Input.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import Tabs from "@/components/ui/Tabs.jsx";
import Textarea from "@/components/ui/Textarea.jsx";
import { useCourse, useEnroll, useSubmitReview } from "@/hooks/useCourses.js";
import { useEnrollments } from "@/hooks/useProgress.js";
import { useUiStore } from "@/store/uiStore.js";

const tabItems = [
  { label: "Overview", value: "overview" },
  { label: "Curriculum", value: "curriculum" },
  { label: "Reviews", value: "reviews" },
  { label: "Instructor", value: "instructor" },
];

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseQuery = useCourse(id);
  const enrollmentsQuery = useEnrollments();
  const enrollMutation = useEnroll();
  const reviewMutation = useSubmitReview(id);
  const activeTab = useUiStore((state) => state.courseTab);
  const setCourseTab = useUiStore((state) => state.setCourseTab);
  const [openModules, setOpenModules] = useState([]);
  const [reviewValues, setReviewValues] = useState({ rating: 5, comment: "" });

  const course = courseQuery.data;
  const isEnrolled = useMemo(() => {
    return enrollmentsQuery.data?.some((item) => item.courseId === course?.id);
  }, [enrollmentsQuery.data, course?.id]);

  function handleToggleModule(moduleId) {
    setOpenModules((current) => (current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]));
  }

  async function handleEnroll() {
    if (!course) return;
    const firstLessonId = course.lessons[0]?.id;
    await enrollMutation.mutateAsync({ courseId: course.id, lessonId: firstLessonId });
    navigate(`/learn/${course.id}/${firstLessonId}`);
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    await reviewMutation.mutateAsync(reviewValues);
    setReviewValues({ rating: 5, comment: "" });
  }

  if (courseQuery.isLoading || enrollmentsQuery.isLoading) {
    return (
      <PageShell title="Course details" subtitle="Review the curriculum, expected outcomes, and lesson breakdown before you jump in.">
        <Spinner label="Loading course" />
      </PageShell>
    );
  }

  if (courseQuery.isError) {
    return (
      <PageShell title="Course details" subtitle="Review the curriculum, expected outcomes, and lesson breakdown before you jump in.">
        <ErrorState message={courseQuery.error.message} onAction={() => courseQuery.refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Course details" subtitle="Review the curriculum, expected outcomes, and lesson breakdown before you jump in.">
      <CourseHero course={course} isEnrolled={isEnrolled} isPending={enrollMutation.isPending} onEnroll={handleEnroll} />
      <Tabs items={tabItems} value={activeTab} onChange={setCourseTab} />
      {activeTab === "overview" ? (
        <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="surface p-6">
            <h2 className="text-xl font-semibold text-slate-950">Course overview</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{course.description}</p>
          </div>
          <div className="surface p-6">
            <h2 className="text-xl font-semibold text-slate-950">Quick facts</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Instructor: {course.instructorName}</p>
              <p>Lessons: {course.totalLessons}</p>
              <p>Status: {course.status}</p>
              <p>Enrollment count: {course.enrollmentCount.toLocaleString()}</p>
            </div>
            {isEnrolled ? <Link to={`/learn/${course.id}/${course.lessons[0].id}`} className="mt-5 inline-flex text-sm font-semibold text-brand-600">Go to player</Link> : null}
          </div>
        </section>
      ) : null}
      {activeTab === "curriculum" ? (
        <ModuleAccordion
          modules={course.modules}
          activeLessonId={course.lessons[0]?.id}
          isEnrolled={isEnrolled}
          courseId={course.id}
          openModules={openModules.length ? openModules : [course.modules[0]?.id].filter(Boolean)}
          onToggle={handleToggleModule}
        />
      ) : null}
      {activeTab === "reviews" ? (
        <section className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {course.reviews.length ? <ReviewList reviews={course.reviews} /> : <EmptyState title="No reviews yet" message="Be the first learner to leave structured feedback." />}
          <form className="surface p-6" onSubmit={handleReviewSubmit}>
            <h2 className="text-xl font-semibold text-slate-950">Write a review</h2>
            <Input label="Rating (1-5)" type="number" min="1" max="5" value={reviewValues.rating} onChange={(event) => setReviewValues((current) => ({ ...current, rating: Number(event.target.value) }))} className="mt-4" />
            <Textarea label="Feedback" className="mt-4" value={reviewValues.comment} onChange={(event) => setReviewValues((current) => ({ ...current, comment: event.target.value }))} required />
            <Button type="submit" className="mt-4" disabled={reviewMutation.isPending}>{reviewMutation.isPending ? "Submitting..." : "Submit review"}</Button>
          </form>
        </section>
      ) : null}
      {activeTab === "instructor" ? (
        <section className="surface p-6">
          <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
          <p className="mt-4 text-lg font-medium text-slate-900">{course.instructorName}</p>
          <p className="mt-2 text-sm text-slate-500">{course.instructorHeadline}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">This course is part of a production-grade LMS flow with enrollment-aware curriculum, learner reviews, route-based playback, and CMS approvals.</p>
        </section>
      ) : null}
    </PageShell>
  );
}

