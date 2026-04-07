import Badge from "@/components/common/Badge.jsx";

export default function CourseTable({ courses }) {
  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-5">
        <h3 className="text-lg font-semibold text-slate-950">Course performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Enrolled</th>
              <th className="px-6 py-4">Earnings</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-950">{course.title}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{course.enrolled.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{course.earnings}</td>
                <td className="px-6 py-4">
                  <Badge className={course.status === "Live" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                    {course.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

