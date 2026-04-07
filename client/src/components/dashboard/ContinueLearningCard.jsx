import { Link } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";

export default function ContinueLearningCard({ course }) {
  return (
    <div className="surface flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between">
          <Badge>{course.category}</Badge>
          <span className="text-sm font-medium text-slate-500">{course.progress}% complete</span>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-950">{course.title}</h3>
        <p className="mt-3 text-sm text-slate-500">{course.mentor}</p>
      </div>
      <div className="mt-8">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-950" style={{ width: `${course.progress}%` }} />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">{course.lessons} lessons</p>
          <Link to={`/student/learn/${course.id}/${course.lessonsList[0].id}`} className="text-sm font-semibold text-brand-600">
            Resume
          </Link>
        </div>
      </div>
    </div>
  );
}

