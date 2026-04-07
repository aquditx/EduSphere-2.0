import { Link, useParams } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useCourse } from "@/hooks/useCourses.js";

export default function InstructorCoursePreviewPage() {
  const { id } = useParams();
  const courseQuery = useCourse(id);

  if (courseQuery.isLoading) {
    return (
      <PageShell title="Preview mode" subtitle="View the student-facing course experience.">
        <Spinner label="Loading preview" />
      </PageShell>
    );
  }

  if (courseQuery.isError) {
    return (
      <PageShell title="Preview mode" subtitle="View the student-facing course experience.">
        <ErrorState message={courseQuery.error.message} onAction={() => courseQuery.refetch()} />
      </PageShell>
    );
  }

  const course = courseQuery.data;

  return (
    <PageShell title="Preview mode" subtitle="View the student-facing course experience." fullWidth>
      <div className="surface p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{course.subtitle}</p>
          </div>
          <Link to={`/instructor/course/${id}/edit`} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Back to editor
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_0.5fr]">
        <section className="space-y-6">
          <div className="surface p-6">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden bg-slate-950"> 
                <img src={course.thumbnail} alt={course.title} className="h-64 w-full object-cover" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{course.level}</Badge>
                  <Badge>{course.category}</Badge>
                </div>
                <p className="text-sm text-slate-600">{course.description}</p>
              </div>
            </div>
          </div>

          {course.modules.map((module) => (
            <div key={module.id} className="surface p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{module.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{module.lessons.length} lessons</p>
                </div>
                <Badge>{module.lessons.length} lessons</Badge>
              </div>
              <div className="mt-5 space-y-3">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">{lesson.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{lesson.type || "Video"} • {lesson.durationSeconds ? `${lesson.durationSeconds} sec` : "TBD"}</p>
                      </div>
                      <Badge>{lesson.preview ? "Preview" : "Locked"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-6">
          <div className="surface p-6">
            <h2 className="text-xl font-semibold text-slate-950">Course outline</h2>
            <div className="mt-5 space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="space-y-2 rounded-3xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-950">{module.title}</p>
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between text-sm text-slate-600">
                        <span>{lesson.title}</span>
                        <span>{lesson.preview ? "Preview" : "Locked"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
            <p className="mt-2 text-sm text-slate-500">{course.instructorName}</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
