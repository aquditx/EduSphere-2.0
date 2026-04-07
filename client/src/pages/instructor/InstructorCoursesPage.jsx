import { Link } from "react-router-dom";
import CourseCard from "@/components/course/CourseCard.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useCourses } from "@/hooks/useCourses.js";
import { useAuthStore } from "@/store/authStore.js";

export default function InstructorCoursesPage() {
  const user = useAuthStore((state) => state.user);
  const coursesQuery = useCourses({ instructorId: user.id, status: "all", page: 1, pageSize: 20, sort: "newest" });

  if (coursesQuery.isLoading) {
    return <PageShell title="Instructor courses" subtitle="Manage your draft and published courses."><Spinner label="Loading courses" /></PageShell>;
  }

  if (coursesQuery.isError) {
    return <PageShell title="Instructor courses" subtitle="Manage your draft and published courses."><ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} /></PageShell>;
  }

  return (
    <PageShell title="Instructor courses" subtitle="Manage your draft and published courses.">
      <div className="flex justify-end">
        <Link to="/instructor/create" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Create course
        </Link>
      </div>
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {coursesQuery.data.items.map((course) => (
          <div key={course.id} className="space-y-3">
            <CourseCard course={course} />
            <div className="flex justify-end"><Link to={`/instructor/course/${course.id}/edit`} className="text-sm font-semibold text-brand-600">Edit course</Link></div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
