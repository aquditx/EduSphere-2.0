import { CheckCircle2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDuration } from "@/utils/index.js";

export default function CourseSidebar({ course, activeLessonId, progress, isEnrolled }) {
  return (
    <aside className="surface w-full p-4 xl:w-96">
      <h2 className="px-2 py-3 text-lg font-semibold text-slate-950">Lesson playlist</h2>
      <div className="space-y-2">
        {course.lessons.map((lesson, index) => {
          const active = lesson.id === activeLessonId;
          const completed = progress?.completedLessonIds?.includes(lesson.id);
          const locked = !isEnrolled && !lesson.preview;
          return (
            <Link
              key={lesson.id}
              to={locked ? `#locked-${lesson.id}` : `/learn/${course.id}/${lesson.id}`}
              aria-disabled={locked}
              className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition ${
                active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              } ${locked ? "pointer-events-none opacity-60" : ""}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/10" : "bg-white"}`}>
                {completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <PlayCircle className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Lesson {index + 1}</p>
                <p className="mt-1 text-sm font-medium">{lesson.title}</p>
              </div>
              <span className={`text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{formatDuration(lesson.durationSeconds)}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

