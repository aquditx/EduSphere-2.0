import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell.jsx";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourses, useUpdateCourse } from "@/hooks/useCourses.js";

export default function AdminCoursesPage() {
  const coursesQuery = useCourses({ page: 1, pageSize: 50, sort: "newest", status: "all" });
  const updateCourseMutation = useUpdateCourse();

  if (coursesQuery.isLoading) {
    return <PageShell title="Admin courses" subtitle="Approve, reject, and inspect the full catalog."><Spinner label="Loading courses" /></PageShell>;
  }

  if (coursesQuery.isError) {
    return <PageShell title="Admin courses" subtitle="Approve, reject, and inspect the full catalog."><ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} /></PageShell>;
  }

  return (
    <PageShell title="Admin courses" subtitle="Approve, reject, and inspect the full catalog.">
      <section className="surface overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Instructor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coursesQuery.data.items.map((course) => (
              <tr key={course.id} className="border-t border-slate-200">
                <td className="px-6 py-4 font-medium text-slate-900">{course.title}</td>
                <td className="px-6 py-4 text-slate-600">{course.instructorName}</td>
                <td className="px-6 py-4 capitalize text-slate-600">{course.status}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-3">
                    {course.status !== "approved" ? <Button variant="secondary" onClick={() => updateCourseMutation.mutate({ courseId: course.id, payload: { status: "approved" } })}>Approve</Button> : null}
                    {course.status !== "pending" ? <Button variant="secondary" onClick={() => updateCourseMutation.mutate({ courseId: course.id, payload: { status: "pending" } })}>Send to review</Button> : null}
                    <Link to={`/courses/${course.id}`} className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-900">Open</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}

