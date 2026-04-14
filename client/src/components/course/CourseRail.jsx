import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CourseCard from "@/components/course/CourseCard.jsx";

export default function CourseRail({ title, subtitle, eyebrow, courses, viewAllHref }) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</span>
          ) : null}
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {viewAllHref ? (
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.slice(0, 4).map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            instructorHref={`/instructor/${course.instructorId}/profile`}
            actionLabel="View course"
            actionHref={`/courses/${course.id}/preview`}
          />
        ))}
      </div>
    </section>
  );
}
