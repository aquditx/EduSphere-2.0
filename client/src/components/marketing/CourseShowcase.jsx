import { Link } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import SectionHeader from "@/components/common/SectionHeader.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourses } from "@/hooks/useCourses.js";
import { formatMinutes } from "@/utils/index.js";

export default function CourseShowcase() {
  const coursesQuery = useCourses({ sort: "most-popular", page: 1, pageSize: 3 });
  const courses = coursesQuery.data?.items || [];

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeader
        eyebrow="Popular catalog"
        title="Launch a premium learning storefront with reusable cards and detail views."
        description="From Microservices architecture to Advanced Frontend development, our courses are designed by industry veterans to take you from fundamentals to production-ready engineering."
        action={
          <Link to="/courses" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            See all courses
          </Link>
        }
      />

      {coursesQuery.isLoading ? (
        <div className="mt-10">
          <Spinner label="Loading catalog highlights" />
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {courses.map((course) => (
          <article key={course.id} className="surface overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${course.accent || "from-slate-600 to-slate-900"} p-6 text-white`}>
              <img src={course.thumbnail} alt={course.title} className="absolute inset-0 h-full w-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-slate-950/20" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <Badge className="bg-white/15 text-white">{course.category}</Badge>
                  <Badge className="bg-white/15 text-white">{course.level}</Badge>
                </div>
                <div>
                  <p className="text-sm text-white/80">{course.instructorName}</p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">{course.title}</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-slate-600">{course.subtitle}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{course.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">{formatMinutes(course.durationMinutes)}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{course.ratingAverage} rating</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{course.language || "English"}</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-950">{Number(course.price) > 0 ? `$${course.price}` : "Free"}</p>
                <Link to={`/courses/${course.id}/preview`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  View course
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
