import { BookOpen, Clock3, Star, Users } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import { formatMinutes } from "@/utils/index.js";

export default function CourseHero({ course, isEnrolled, isPending, onEnroll }) {
  return (
    <section className="surface overflow-hidden">
      <div className={`bg-gradient-to-br ${course.accent} p-8 text-white md:p-10`}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{course.category}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">{course.title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/80">{course.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/85">
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {course.instructorName}</span>
          <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {course.ratingAverage} ({course.ratingCount})</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {formatMinutes(course.durationMinutes)}</span>
          <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" /> {course.totalLessons} lessons</span>
        </div>
      </div>
      <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">What you will learn</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {outcome}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-500">Course access</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">${course.price}</p>
          <Button className="mt-5 w-full" onClick={onEnroll} disabled={isPending || isEnrolled}>
            {isEnrolled ? "Enrolled" : isPending ? "Enrolling..." : "Enroll now"}
          </Button>
        </div>
      </div>
    </section>
  );
}

