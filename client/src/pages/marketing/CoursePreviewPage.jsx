import { Award, BookOpen, Globe2, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import CourseRail from "@/components/course/CourseRail.jsx";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import Button from "@/components/ui/Button.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import Tabs from "@/components/ui/Tabs.jsx";
import { useCourse, useEnroll } from "@/hooks/useCourses.js";
import { useEnrollments } from "@/hooks/useProgress.js";
import { useAlsoEnrolled, useSimilarCourses, useTrackCourseView } from "@/hooks/useRecommendations.js";
import { useAuthStore } from "@/store/authStore.js";
import { formatDate, formatDuration, formatMinutes } from "@/utils/index.js";

const tabItems = [
  { label: "About", value: "about" },
  { label: "Curriculum", value: "curriculum" },
  { label: "Instructor", value: "instructor" },
  { label: "Reviews", value: "reviews" },
];

export default function CoursePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const courseQuery = useCourse(id);
  const enrollmentsQuery = useEnrollments();
  const enrollMutation = useEnroll();
  const [activeTab, setActiveTab] = useState("about");
  const [reviewSort, setReviewSort] = useState("recent");
  const similarCourses = useSimilarCourses(id, 4);
  const alsoEnrolled = useAlsoEnrolled(id, 4);
  useTrackCourseView(id);

  const course = courseQuery.data;
  const isStudent = user.role === "student";
  const isEnrolled = useMemo(
    () => Boolean(course?.id && enrollmentsQuery.data?.some((item) => item.courseId === course.id)),
    [course?.id, enrollmentsQuery.data]
  );

  async function handlePrimaryAction() {
    if (!course) return;

    if (!isStudent) {
      navigate("/login?role=student");
      return;
    }

    if (isEnrolled) {
      navigate(`/courses/${course.id}`);
      return;
    }

    if (Number(course.price) > 0) {
      navigate(`/checkout/${course.id}`);
      return;
    }

    const firstLessonId = course.lessons[0]?.id;
    await enrollMutation.mutateAsync({ courseId: course.id, lessonId: firstLessonId });
    navigate(`/courses/${course.id}`);
  }

  if (courseQuery.isLoading || (isStudent && enrollmentsQuery.isLoading)) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Spinner label="Loading course preview" />
        </div>
      </PageFrame>
    );
  }

  if (courseQuery.isError) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <ErrorState message={courseQuery.error.message} onAction={() => courseQuery.refetch()} />
        </div>
      </PageFrame>
    );
  }

  const skills = buildSkills(course);
  const highlights = [
    `${course.modules.length} modules`,
    `${course.ratingAverage} rating`,
    `${course.level} level`,
    "Flexible schedule",
    `${Math.max(90, Math.round(course.ratingAverage * 20))}% learners liked this course`,
  ];

  return (
    <PageFrame>
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="surface overflow-hidden">
          <div className="grid gap-10 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">{course.category}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-500">{course.subtitle}</p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {course.instructorName}</span>
                <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.ratingAverage} ({course.ratingCount.toLocaleString()})</span>
                <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" /> {course.totalLessons} lessons</span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button onClick={handlePrimaryAction} disabled={enrollMutation.isPending}>
                  {isEnrolled ? "Go to course" : enrollMutation.isPending ? "Enrolling..." : "Enroll"}
                </Button>
                <p className="text-sm text-slate-500">{course.enrollmentCount.toLocaleString()} already enrolled</p>
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
              <img src={course.thumbnail} alt={course.title} className="absolute inset-0 h-full w-full object-cover opacity-25" />
              <div className={`absolute inset-0 bg-gradient-to-br ${course.accent} opacity-30`} />
              <div className="absolute -right-16 top-6 h-64 w-64 rounded-full border-[30px] border-white/30" />
              <div className="absolute -right-4 top-20 h-40 w-40 rounded-full border-[20px] border-white/20" />
            </div>
          </div>

          <div className="grid gap-px border-t border-slate-200 bg-slate-200 md:grid-cols-5">
            {highlights.map((item) => (
              <div key={item} className="bg-white px-5 py-4 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === "about" ? (
          <section className="mt-8 space-y-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <article className="surface p-8">
                <h2 className="text-2xl font-semibold text-slate-950">What you&apos;ll learn</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <div key={outcome} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                      {outcome}
                    </div>
                  ))}
                </div>

                <h3 className="mt-8 text-lg font-semibold text-slate-950">Skills you&apos;ll gain</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>

                <h3 className="mt-8 text-lg font-semibold text-slate-950">Details to know</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <InfoTile icon={Award} title="Shareable certificate" detail="Add to your portfolio after completion." />
                  <InfoTile icon={BookOpen} title="Assessments" detail={`${course.modules.length} module checkpoints`} />
                  <InfoTile icon={Globe2} title={`Taught in ${course.language || "English"}`} detail={course.lastUpdated ? `Updated ${formatDate(course.updatedAt)}` : "Subtitles available"} />
                </div>
              </article>

              <aside className="surface p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Build your expertise</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{course.description}</p>
                <img src={course.thumbnail} alt={course.title} className="mt-6 h-52 w-full rounded-[1.5rem] object-cover" />
              </aside>
            </div>
          </section>
        ) : null}

        {activeTab === "curriculum" ? (
          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <article className="surface p-8">
              <h2 className="text-2xl font-semibold text-slate-950">There are {course.modules.length} modules in this course</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{course.description}</p>
              <div className="mt-8 space-y-4">
                {course.modules.map((module, index) => (
                  <div key={module.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">{module.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                          Module {index + 1} • {module.lessons.length} lessons • {formatMinutes(Math.ceil(module.lessons.reduce((total, lesson) => total + lesson.durationSeconds, 0) / 60))}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <div>
                            <p className="font-medium text-slate-900">{lesson.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{lesson.preview ? "Preview lesson" : "Locked until enrollment"}</p>
                          </div>
                          <span className="text-xs text-slate-400">{formatDuration(lesson.durationSeconds)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="space-y-6">
              <div className="surface p-6">
                <p className="text-lg font-semibold text-slate-950">Instructor</p>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{course.instructorName}</p>
                  <p className="mt-1 text-sm text-slate-500">{course.instructorHeadline}</p>
                  <Link to={`/instructor/${course.instructorId}/profile`} className="mt-4 inline-flex text-sm font-semibold text-brand-600">
                    View public profile
                  </Link>
                </div>
              </div>

              <div className="surface p-6">
                <p className="text-lg font-semibold text-slate-950">Offered by</p>
                <div className="mt-4 rounded-2xl border border-slate-200 px-4 py-4 text-sm text-slate-600">
                  EduSphere Learning
                </div>
              </div>
            </aside>
          </section>
        ) : null}

        {activeTab === "instructor" ? (
          <section className="mt-8">
            <div className="surface p-8">
              <h2 className="text-2xl font-semibold text-slate-950">Instructor</h2>
              <p className="mt-4 text-lg font-medium text-slate-950">{course.instructorName}</p>
              <p className="mt-2 text-sm text-slate-500">{course.instructorHeadline}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Explore the instructor profile, published courses, and learner reviews before you enroll.
              </p>
              <Link to={`/instructor/${course.instructorId}/profile`} className="mt-5 inline-flex text-sm font-semibold text-brand-600">
                Open instructor profile
              </Link>
            </div>
          </section>
        ) : null}

        {activeTab === "reviews" ? (
          <ReviewsTab course={course} sort={reviewSort} onSortChange={setReviewSort} />
        ) : null}
      </main>

      {similarCourses.length > 0 ? (
        <CourseRail
          eyebrow="Keep exploring"
          title="Similar courses"
          subtitle="Picked based on shared skills, category, and level."
          courses={similarCourses}
        />
      ) : null}

      {alsoEnrolled.length > 0 ? (
        <CourseRail
          eyebrow="Students also enrolled in"
          title="Popular with learners who took this"
          courses={alsoEnrolled}
        />
      ) : null}
    </PageFrame>
  );
}

function ReviewsTab({ course, sort, onSortChange }) {
  const reviews = course.reviews || [];
  const totalReviews = reviews.length;
  const buckets = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => Math.round(review.rating) === star).length;
    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percent };
  });

  const sortedReviews = reviews.slice().sort((a, b) => {
    if (sort === "highest") return (b.rating || 0) - (a.rating || 0);
    if (sort === "lowest") return (a.rating || 0) - (b.rating || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (totalReviews === 0) {
    return (
      <section className="mt-8">
        <EmptyState title="No reviews yet" message="Learner feedback will appear here after the first enrollments." />
      </section>
    );
  }

  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="surface p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Overall rating</p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-5xl font-semibold text-slate-950">{course.ratingAverage}</span>
          <span className="pb-2 text-sm text-slate-500">/ 5</span>
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${index < Math.round(course.ratingAverage) ? "fill-current" : ""}`}
            />
          ))}
          <span className="ml-2 text-xs text-slate-500">{course.ratingCount?.toLocaleString?.() || course.ratingCount} ratings</span>
        </div>

        <div className="mt-6 space-y-3">
          {buckets.map((bucket) => (
            <div key={bucket.star} className="flex items-center gap-3 text-sm text-slate-500">
              <span className="w-6 font-semibold text-slate-700">{bucket.star}★</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-amber-400"
                  style={{ width: `${bucket.percent}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-slate-500">{bucket.percent}%</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="surface p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-950">Learner reviews</h2>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Sort by
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900"
            >
              <option value="recent">Most recent</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {sortedReviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{review.userName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{formatDate(review.createdAt)}</p>
                </div>
                <div className="inline-flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold text-slate-900">{review.rating}</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageFrame({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}

function InfoTile({ icon: Icon, title, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-slate-500" />
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function buildSkills(course) {
  if (Array.isArray(course.skills) && course.skills.length > 0) {
    return course.skills.slice(0, 10);
  }
  return Array.from(new Set([course.category, course.level, ...(course.outcomes || [])])).slice(0, 8);
}
