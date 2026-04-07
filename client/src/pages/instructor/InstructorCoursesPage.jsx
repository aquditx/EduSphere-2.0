import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Modal from "@/components/ui/Modal.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import InstructorCourseCard from "@/components/instructor/InstructorCourseCard.jsx";
import { useAuthStore } from "@/store/authStore.js";
import { useInstructorCourses, useDuplicateCourse, useArchiveCourse } from "@/hooks/useInstructorHooks.js";
import { useDeleteCourse } from "@/hooks/useCourses.js";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Published" },
  { value: "archived", label: "Archived" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-enrolled", label: "Most enrolled" },
  { value: "highest-rated", label: "Highest rated" },
  { value: "revenue", label: "Revenue" },
];

export default function InstructorCoursesPage() {
  const user = useAuthStore((state) => state.user);
  const [view, setView] = useState(() => window.localStorage.getItem("edusphere-instructor-course-view") || "grid");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    window.localStorage.setItem("edusphere-instructor-course-view", view);
  }, [view]);

  const coursesQuery = useInstructorCourses({ instructorId: user.id, status, sort, search, page: 1, pageSize: 40 });
  const duplicateMutation = useDuplicateCourse();
  const archiveMutation = useArchiveCourse();
  const deleteMutation = useDeleteCourse();

  const courses = coursesQuery.data?.items || [];

  const filteredCourses = useMemo(() => {
    if (!search) return courses;
    const normalized = search.toLowerCase();
    return courses.filter((course) => course.title.toLowerCase().includes(normalized) || course.subtitle.toLowerCase().includes(normalized));
  }, [courses, search]);

  const isBulkActionPending = duplicateMutation.isLoading || archiveMutation.isLoading || deleteMutation.isLoading;

  function toggleSelection(courseId) {
    setSelectedIds((current) => (current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId]));
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => deleteMutation.mutate(id));
    setSelectedIds([]);
    setConfirm(null);
  }

  function handleBulkArchive() {
    selectedIds.forEach((id) => archiveMutation.mutate(id));
    setSelectedIds([]);
    setConfirm(null);
  }

  if (coursesQuery.isLoading) {
    return <PageShell title="Instructor courses" subtitle="Manage your draft and published courses."><Spinner label="Loading courses" /></PageShell>;
  }

  if (coursesQuery.isError) {
    return <PageShell title="Instructor courses" subtitle="Manage your draft and published courses."><ErrorState message={coursesQuery.error.message} onAction={() => coursesQuery.refetch()} /></PageShell>;
  }

  return (
    <PageShell title="Instructor courses" subtitle="Manage your draft and published courses.">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={view === "grid" ? "primary" : "secondary"} onClick={() => setView("grid")}>Grid</Button>
          <Button variant={view === "list" ? "primary" : "secondary"} onClick={() => setView("list")}>List</Button>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={sort} onChange={(event) => setSort(event.target.value)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            placeholder="Search courses"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Link to="/instructor/create" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Create course</Link>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState title="No courses found" message="Create your first course or adjust filters to see your catalog." action={<Link to="/instructor/create" className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Create your first course</Link>} />
      ) : (
        <>
          <div className="surface rounded-[2rem] border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-500">{selectedIds.length} selected</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setConfirm("archive")} disabled={!selectedIds.length || isBulkActionPending}>Bulk archive</Button>
                <Button variant="danger" onClick={() => setConfirm("delete")} disabled={!selectedIds.length || isBulkActionPending}>Bulk delete</Button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid gap-6 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="relative">
                  <label className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                    <input type="checkbox" checked={selectedIds.includes(course.id)} onChange={() => toggleSelection(course.id)} />
                    Select
                  </label>
                  <InstructorCourseCard
                    course={course}
                    onDuplicate={(courseId) => duplicateMutation.mutate(courseId)}
                    onArchive={(courseId) => archiveMutation.mutate(courseId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="surface overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 text-sm uppercase tracking-[0.14em] text-slate-500">Course catalog</div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.14em]">
                    <tr>
                      <th className="px-6 py-4">Select</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Enrolled</th>
                      <th className="px-6 py-4">Revenue</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(course.id)} onChange={() => toggleSelection(course.id)} /></td>
                        <td className="px-6 py-4 font-medium text-slate-950">{course.title}</td>
                        <td className="px-6 py-4"><Badge className={course.status === "approved" ? "bg-emerald-50 text-emerald-700" : course.status === "draft" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}>{course.status}</Badge></td>
                        <td className="px-6 py-4 text-slate-600">{course.enrollmentCount?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4 text-slate-600">${course.price?.toFixed(2) || "0.00"}</td>
                        <td className="px-6 py-4 text-slate-600 space-x-2">
                          <Link to={`/instructor/course/${course.id}/edit`} className="text-brand-600">Edit</Link>
                          <button type="button" className="text-brand-600" onClick={() => duplicateMutation.mutate(course.id)}>Duplicate</button>
                          <button type="button" className="text-rose-600" onClick={() => archiveMutation.mutate(course.id)}>Archive</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={Boolean(confirm)} title="Confirm action" onClose={() => setConfirm(null)} footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirm === "delete" ? handleBulkDelete : handleBulkArchive} disabled={isBulkActionPending}>
            {confirm === "delete" ? "Delete selected" : "Archive selected"}
          </Button>
        </div>
      }>
        <p className="text-sm text-slate-600">Are you sure you want to {confirm === "delete" ? "delete" : "archive"} these courses? This cannot be undone.</p>
      </Modal>
    </PageShell>
  );
}
