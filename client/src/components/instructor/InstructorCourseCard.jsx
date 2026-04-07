import { Link } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/ui/Button.jsx";

export default function InstructorCourseCard({ course, onDuplicate, onArchive, onDelete }) {
  return (
    <article className="surface overflow-hidden rounded-[2rem]">
      <img className="h-48 w-full object-cover" src={course.thumbnail} alt={course.title} />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={course.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}>{course.status}</Badge>
          <Badge>{course.category}</Badge>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-950">{course.title}</h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{course.subtitle}</p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <span>{course.enrollmentCount?.toLocaleString() || 0} students</span>
          <span>{course.ratingAverage?.toFixed(1) || "0.0"}★ rating</span>
          <span>{course.price ? `$${course.price.toFixed(2)}` : "Free"}</span>
          <span>Updated {course.updatedAt?.slice(0, 10)}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/instructor/course/${course.id}/edit`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-950">
            Edit
          </Link>
          <Link to={`/instructor/course/${course.id}/preview`} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Preview
          </Link>
          <Button variant="secondary" onClick={() => onDuplicate?.(course.id)}>
            Duplicate
          </Button>
          <Button variant="danger" onClick={() => onArchive?.(course.id)}>
            Archive
          </Button>
        </div>
      </div>
    </article>
  );
}
