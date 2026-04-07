import { Clock3, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";

export default function CourseCard({ course }) {
  return (
    <article className="surface overflow-hidden">
      <div className={`h-44 bg-gradient-to-br ${course.accent} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <Badge className="bg-white/15 text-white">{course.category}</Badge>
          <div className="rounded-2xl bg-white/15 px-3 py-1 text-sm font-medium">{course.progress}% done</div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <span>{course.level}</span>
          <span>{course.lessons} lessons</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-slate-950">{course.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">{course.description}</p>
        <div className="mt-5 flex items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.rating}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" /> {course.duration}
          </span>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{course.mentor}</p>
            <p className="text-lg font-semibold text-slate-950">${course.price}</p>
          </div>
          <Link
            to={`/student/courses/${course.id}`}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Explore
          </Link>
        </div>
      </div>
    </article>
  );
}

