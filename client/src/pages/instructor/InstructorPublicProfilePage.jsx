import { Globe, Linkedin, Star, Twitter, Users, Youtube } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseCard from "@/components/course/CourseCard.jsx";
import Badge from "@/components/common/Badge.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import { useInstructorPublicProfile } from "@/hooks/useInstructorHooks.js";
import { useAuthStore } from "@/store/authStore.js";
import { formatDate } from "@/utils/index.js";

const socialLinks = [
  { key: "website", icon: Globe, label: "Website" },
  { key: "twitter", icon: Twitter, label: "Twitter" },
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "youtube", icon: Youtube, label: "YouTube" },
];

const REVIEWS_PER_PAGE = 10;

export default function InstructorPublicProfilePage() {
  const { instructorId } = useParams();
  const user = useAuthStore((state) => state.user);
  const profileQuery = useInstructorPublicProfile(instructorId);
  const [reviewPage, setReviewPage] = useState(1);

  if (profileQuery.isLoading) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Spinner label="Loading instructor profile" />
        </div>
      </PageFrame>
    );
  }

  if (profileQuery.isError) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <ErrorState message={profileQuery.error.message} onAction={() => profileQuery.refetch()} />
        </div>
      </PageFrame>
    );
  }

  const { instructor, courses, reviewStats } = profileQuery.data;
  const visibleReviews = reviewStats.latestReviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);
  const totalReviewPages = Math.max(1, Math.ceil(reviewStats.latestReviews.length / REVIEWS_PER_PAGE));
  const safeBio = sanitizeHtml(instructor.bio);
  const courseActionLabel = user.role === "student" ? "Go to course" : "Enroll";
  const courseActionHref = (courseId) => (user.role === "student" ? `/courses/${courseId}` : "/login?role=student");

  return (
    <PageFrame>
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <section className="surface p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
            <div>
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-2xl font-semibold text-white">
                  {instructor.avatar || initials(instructor.name)}
                </div>
                <div>
                  <h1 className="text-4xl font-semibold text-slate-950">{instructor.name}</h1>
                  <p className="mt-2 text-lg text-slate-500">{instructor.headline}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total students" value={reviewStats.totalStudents.toLocaleString()} icon={Users} />
                <StatCard label="Courses published" value={String(courses.length)} icon={Users} />
                <StatCard label="Average rating" value={reviewStats.avgRating} icon={Star} />
                <StatCard label="Total reviews" value={String(reviewStats.totalReviews)} icon={Star} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Connect</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map(({ key, icon: Icon, label }) =>
                  instructor[key] ? (
                    <a
                      key={key}
                      href={instructor[key]}
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ) : null
                )}
              </div>
              {instructor.topics?.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {instructor.topics.map((topic) => (
                    <Badge key={topic}>{topic}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <article className="surface p-8">
            <h2 className="text-2xl font-semibold text-slate-950">About</h2>
            <div className="mt-4 text-sm leading-7 text-slate-600" dangerouslySetInnerHTML={{ __html: safeBio }} />
          </article>

          <article className="surface p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-950">Courses</h2>
              <Link to={`/courses?instructor=${instructorId}`} className="text-sm font-semibold text-brand-600">
                See all courses by this instructor
              </Link>
            </div>
            {courses.length === 0 ? (
              <div className="mt-6">
                <EmptyState title="No published courses yet" message="This instructor has not published any courses yet." />
              </div>
            ) : (
              <div className="mt-6 grid gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    instructorHref={`/instructor/${course.instructorId}/profile`}
                    actionLabel={courseActionLabel}
                    actionHref={courseActionHref(course.id)}
                    actionVariant={user.role === "student" ? "secondary" : "primary"}
                  />
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="surface p-8">
            <h2 className="text-2xl font-semibold text-slate-950">Reviews</h2>
            <div className="mt-6 space-y-4">
              {reviewStats.distribution.map((item) => (
                <div key={item.rating} className="grid grid-cols-[40px_1fr_48px] items-center gap-3 text-sm text-slate-600">
                  <span>{item.rating} star</span>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-slate-950" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="surface p-8">
            <h2 className="text-2xl font-semibold text-slate-950">Latest reviews</h2>
            {visibleReviews.length === 0 ? (
              <div className="mt-6">
                <EmptyState title="No reviews yet" message="Published course reviews will appear here." />
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-5">
                  {visibleReviews.map((review) => (
                    <div key={review.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{review.userName || "Anonymous"}</p>
                          <p className="mt-1 text-sm text-slate-500">{review.courseTitle}</p>
                        </div>
                        <div className="text-sm text-slate-500">{formatDate(review.createdAt)}</div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
                {totalReviewPages > 1 ? (
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
                      disabled={reviewPage <= 1}
                      onClick={() => setReviewPage((page) => Math.max(1, page - 1))}
                    >
                      Previous
                    </button>
                    <p className="text-sm text-slate-500">Page {reviewPage} of {totalReviewPages}</p>
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
                      disabled={reviewPage >= totalReviewPages}
                      onClick={() => setReviewPage((page) => Math.min(totalReviewPages, page + 1))}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </article>
        </section>

        {user.role === "guest" ? (
          <section className="mt-8">
            <div className="surface rounded-[2rem] px-8 py-10 text-center">
              <h2 className="text-3xl font-semibold text-slate-950">Learn from {instructor.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Browse published courses or create a free account to keep your learning in one place.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={`/courses?instructor=${instructorId}`} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Browse courses
                </Link>
                <Link to="/register?role=student" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Sign up free
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PageFrame>
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

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function sanitizeHtml(html) {
  if (!html) return "<p>No bio available yet.</p>";
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "");
}

function initials(name) {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
