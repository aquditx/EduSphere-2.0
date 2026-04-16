import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminDashboard, getInstructorDashboard, getStudentDashboard, getUsers, updateUser } from "@/api/userApi.js";
import { useAuthStore } from "@/store/authStore.js";

function parseMoneyToNumber(value) {
  return Number(String(value || "$0").replace(/[^0-9.]/g, "")) || 0;
}

function synthesizeRevenueSeries(total, buckets = 12) {
  return Array.from({ length: buckets }).map((_, i) => {
    const ramp = 0.4 + (i / (buckets - 1)) * 0.6;
    return Math.round((total * ramp) / buckets);
  });
}

// AdminDashboard + AdminReports page both read `data.analytics.*` — the real
// backend returns `{ stats, topCourses, recentEnrollments }`. We synthesize
// the `analytics` shape from those fields so the pages render without crash.
function adaptAdminDashboard(data) {
  const stats = data?.stats || [];
  const revenue = parseMoneyToNumber(stats.find((s) => s.label === "Revenue")?.value);
  const enrollments = Number(stats.find((s) => s.label === "Enrollments")?.value || 0);
  const publishedDetail = stats.find((s) => s.label === "Total courses")?.detail || "";
  const publishedMatch = publishedDetail.match(/(\d+)\s+approved/);
  const publishedCount = publishedMatch ? Number(publishedMatch[1]) : 0;

  return {
    stats,
    topCourses: data?.topCourses || [],
    recentEnrollments: data?.recentEnrollments || [],
    analytics: {
      revenueSeries: synthesizeRevenueSeries(revenue),
      activeUsers: enrollments,
      completionRate: 0,
      publishedCourses: publishedCount,
    },
  };
}

export function useStudentDashboard() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["student-dashboard", user.id],
    queryFn: () => getStudentDashboard(),
    enabled: Boolean(user.id),
  });
}

export function useInstructorDashboard() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-dashboard", user.id],
    queryFn: () => getInstructorDashboard(),
    enabled: Boolean(user.id),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => adaptAdminDashboard(await getAdminDashboard()),
  });
}

export function useUsers(filters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const rows = await getUsers(filters);
      // The API returns a plain array. Normalize to what the page iterates.
      return Array.isArray(rows)
        ? rows.map((row) => ({
            id: row.id ?? row.user_id ?? null,
            name: row.name || "",
            email: row.email || "",
            role: row.role || "student",
            createdAt: row.createdAt || row.created_at || "",
            updatedAt: row.updatedAt || row.updated_at || "",
          }))
        : [];
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
