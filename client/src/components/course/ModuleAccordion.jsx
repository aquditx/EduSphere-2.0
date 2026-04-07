import { ChevronDown, ChevronRight, Lock, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDuration } from "@/utils/index.js";

export default function ModuleAccordion({ modules, activeLessonId, isEnrolled, courseId, openModules, onToggle }) {
  return (
    <div className="space-y-4">
      {modules.map((module) => {
        const open = openModules.includes(module.id);
        return (
          <section key={module.id} className="surface p-4">
            <button className="flex w-full items-center justify-between gap-4 text-left" onClick={() => onToggle(module.id)}>
              <div>
                <p className="text-sm font-semibold text-slate-950">{module.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{module.lessons.length} lessons</p>
              </div>
              {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
            </button>
            {open ? (
              <div className="mt-4 space-y-3">
                {module.lessons.map((lesson, index) => {
                  const unlocked = isEnrolled || lesson.preview;
                  const active = lesson.id === activeLessonId;
                  const content = (
                    <div className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800"}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/10" : "bg-slate-100"}`}>
                        {unlocked ? <PlayCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.16em] opacity-70">Lesson {index + 1}</p>
                        <p className="mt-1 font-medium">{lesson.title}</p>
                      </div>
                      <span className={`text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{formatDuration(lesson.durationSeconds)}</span>
                    </div>
                  );
                  return unlocked ? (
                    <Link key={lesson.id} to={`/learn/${courseId}/${lesson.id}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={lesson.id}>{content}</div>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

