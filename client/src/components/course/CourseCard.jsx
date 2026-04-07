import { Clock3, Star, User } from "lucide-react";
import { Link } from "react-router-dom";
import { formatMinutes } from "@/utils/index.js";

export default function CourseCard({ course, onHover }) {
  return (
    <article className="surface overflow-hidden">
      <Link to={`/courses/${course.id}`} onMouseEnter={() => onHover?.(course.id)} onFocus={() => onHover?.(course.id)}>
        <img src={course.thumbnail} alt={course.title} className="h-48 w-full object-cover" />
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>
        <Link to={`/courses/${course.id}`} onMouseEnter={() => onHover?.(course.id)} onFocus={() => onHover?.(course.id)}>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">{course.title}</h3>
        </Link>
        <p className="mt-2 text-sm text-slate-500">{course.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1"><User className="h-4 w-4" /> {course.instructorName}</span>
          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.ratingAverage} ({course.ratingCount})</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {formatMinutes(course.durationMinutes)}</span>
        </div>
      </div>
    </article>
  );
}

