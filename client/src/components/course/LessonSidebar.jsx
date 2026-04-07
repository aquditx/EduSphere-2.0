import { PlayCircle } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore.js";

export default function LessonSidebar({ lessons }) {
  const lessonId = usePlayerStore((state) => state.lessonId);
  const setLessonId = usePlayerStore((state) => state.setLessonId);

  return (
    <aside className="surface w-full p-4 lg:w-96">
      <h3 className="px-2 py-3 text-lg font-semibold text-slate-950">Lesson playlist</h3>
      <div className="space-y-2">
        {lessons.map((lesson, index) => {
          const active = lesson.id === lessonId;

          return (
            <button
              key={lesson.id}
              onClick={() => setLessonId(lesson.id)}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
                active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/10" : "bg-white"}`}>
                <PlayCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Lesson {index + 1}</p>
                <p className="mt-1 text-sm font-medium">{lesson.title}</p>
              </div>
              <span className={`text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{lesson.duration}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

