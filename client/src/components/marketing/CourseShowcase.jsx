import { Link } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import SectionHeader from "@/components/common/SectionHeader.jsx";
import { seedCourses } from "@/data/mockData.js";
import { formatMinutes } from "@/utils/index.js";

export default function CourseShowcase() {
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

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {seedCourses.slice(0, 3).map((course) => (
          <article key={course.id} className="surface overflow-hidden">
            <div className={`h-56 bg-gradient-to-br ${course.accent} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <Badge className="bg-white/15 text-white">{course.category}</Badge>
                <Badge className="bg-white/15 text-white">{course.level}</Badge>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-950">{course.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{course.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span>{course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons</span>
                <span>{formatMinutes(course.durationMinutes)}</span>
                <span>{course.ratingAverage} rating</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-950">${course.price}</p>
                <Link to={`/courses/${course.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
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
