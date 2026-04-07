import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useCourseStudents } from "@/hooks/useInstructorHooks.js";

export default function InstructorCourseStudentsPage() {
  const { id } = useParams();
  const studentsQuery = useCourseStudents(id);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    if (!studentsQuery.data) return [];
    return studentsQuery.data.filter((student) => {
      const normalized = search.toLowerCase();
      return student.name.toLowerCase().includes(normalized) || student.email.toLowerCase().includes(normalized);
    });
  }, [search, studentsQuery.data]);

  if (studentsQuery.isLoading) {
    return (
      <PageShell title="Course students" subtitle="See enrollment, progress, and engagement for your course.">
        <Spinner label="Loading enrolled students" />
      </PageShell>
    );
  }

  if (studentsQuery.isError) {
    return (
      <PageShell title="Course students" subtitle="See enrollment, progress, and engagement for your course.">
        <ErrorState message={studentsQuery.error.message} onAction={() => studentsQuery.refetch()} />
      </PageShell>
    );
  }

  const students = filteredStudents;

  return (
    <PageShell title="Course students" subtitle="See enrollment, progress, and engagement for your course.">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Enrolled students</h2>
          <p className="mt-2 text-sm text-slate-500">Search and export learner records.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            placeholder="Search name or email"
          />
          <Button variant="secondary">Export CSV</Button>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.14em]">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Enrolled</th>
                <th className="px-6 py-4 text-left">Progress</th>
                <th className="px-6 py-4 text-left">Last active</th>
                <th className="px-6 py-4 text-left">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                  <td className="px-6 py-4 font-medium text-slate-950">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600">{student.email}</td>
                  <td className="px-6 py-4 text-slate-600">{student.enrolledAt}</td>
                  <td className="px-6 py-4 text-slate-600">{student.progressPercent}%</td>
                  <td className="px-6 py-4 text-slate-600">{student.lastActive}</td>
                  <td className="px-6 py-4 text-slate-600">{student.rating || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent ? (
        <div className="surface rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{selectedStudent.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{selectedStudent.email}</p>
            </div>
            <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
              Close
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Lessons completed</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{selectedStudent.completedLessons}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Quiz score</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{selectedStudent.quizScore || "—"}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-950">Lesson progress</h4>
              <p className="mt-2 text-sm text-slate-600">{selectedStudent.completedLessons} completed lessons this course.</p>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
