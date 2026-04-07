import { Clock3, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import { formatMinutes } from "@/utils/index.js";

export default function CourseCard({ course, onHover, instructorHref, actionLabel, actionHref, actionVariant = "primary" }) {
  const courseHref = actionLabel === "Enroll" && actionHref ? actionHref : `/courses/${course.id}`;

  return (
    <article className="surface overflow-hidden">
      <Link to={courseHref} onMouseEnter={() => onHover?.(course.id)} onFocus={() => onHover?.(course.id)}>
        <img src={course.thumbnail} alt={course.title} className="h-48 w-full object-cover" />
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>
        <Link to={courseHref} onMouseEnter={() => onHover?.(course.id)} onFocus={() => onHover?.(course.id)}>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">{course.title}</h3>
        </Link>
        <p className="mt-2 text-sm text-slate-500">{course.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          {instructorHref ? (
            <Link to={instructorHref} className="inline-flex items-center gap-1 font-medium text-slate-700 transition hover:text-brand-600">
              {course.instructorName}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">{course.instructorName}</span>
          )}
          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.ratingAverage} ({course.ratingCount})</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {formatMinutes(course.durationMinutes)}</span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-slate-950">{Number(course.price) > 0 ? `$${course.price}` : "Free"}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {course.level}
          </span>
        </div>
        {actionLabel && actionHref ? (
          <div className="mt-6">
            <Link to={actionHref}>
              <Button variant={actionVariant} className="w-full">
                {actionLabel}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
