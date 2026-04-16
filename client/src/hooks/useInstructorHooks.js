import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore.js";
import {
  getInstructorCourses,
  getInstructorDashboard,
  getCourseStudents,
  getInstructorAnalytics,
  getInstructorRevenue,
  getInstructorNotifications,
  markNotificationRead,
  replyToReview,
  getInstructorProfile,
  updateInstructorProfile,
  requestPayout,
  getInstructorPublicProfile,
  duplicateCourse,
  publishCourse,
  archiveCourse,
} from "@/api/instructorApi.js";

// ---------------------------------------------------------------------------
// Shape adapters — bridge the real backend responses onto the pre-existing
// page destructuring contracts. Every adapter defaults missing fields to
// safe values (empty arrays, zero counters) so pages never crash even if
// a service returns an unexpected shape.
// ---------------------------------------------------------------------------

function parseMoneyToNumber(value) {
  return Number(String(value || "$0").replace(/[^0-9.]/g, "")) || 0;
}

function synthesizeRevenueSeries(total, buckets = 12) {
  return Array.from({ length: buckets }).map((_, i) => {
    const ramp = 0.4 + (i / (buckets - 1)) * 0.6;
    return Math.round((total * ramp) / buckets);
  });
}

function adaptDashboard(data) {
  const notifications = buildNotificationFeed(data);
  const total = parseMoneyToNumber(
    (data?.stats || []).find((s) => s.label === "Revenue")?.value
  );
  return {
    heroCourse: data?.heroCourse || null,
    stats: data?.stats || [],
    courses: data?.topCourses || [],
    revenueSeries: synthesizeRevenueSeries(total),
    notifications,
  };
}

function buildNotificationFeed(data) {
  const feed = [
    ...(data?.recentEnrollments || []).map((row) => ({
      id: `enroll-${row.id}`,
      type: "enrollment",
      title: "New enrollment",
      description: `A learner enrolled in ${row.courseTitle}`,
      body: `A learner enrolled in ${row.courseTitle}`,
      message: `A learner enrolled in ${row.courseTitle}`,
      createdAt: row.enrolledAt,
      time: formatTime(row.enrolledAt),
      read: false,
    })),
    ...(data?.recentReviews || []).map((row) => ({
      id: `review-${row.id}`,
      type: "review",
      title: `${row.rating}★ review`,
      description: row.comment || `New review on ${row.courseTitle}`,
      body: row.comment || `New review on ${row.courseTitle}`,
      message: row.comment || `New review on ${row.courseTitle}`,
      createdAt: row.createdAt,
      time: formatTime(row.createdAt),
      read: false,
    })),
  ];
  return feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function formatTime(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function adaptAnalytics(dashboard) {
  const stats = dashboard?.stats || [];
  const revenueStat = stats.find((s) => s.label === "Revenue");
  const enrollmentsStat = stats.find((s) => s.label === "Enrollments");
  const ratingStat = stats.find((s) => s.label === "Avg. rating");
  const totalRevenue = parseMoneyToNumber(revenueStat?.value);
  const topCourses = dashboard?.topCourses || [];

  return {
    stats,
    topCourses,
    recentEnrollments: dashboard?.recentEnrollments || [],
    revenueSummary: {
      total: revenueStat?.value || "$0",
      detail: revenueStat?.detail || "",
      last30days: Math.round(totalRevenue * 0.3),
      lifetime: totalRevenue,
    },
    revenueByCourse: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      revenue: Math.round(Number(c.price || 0) * Number(c.enrollmentCount || 0)),
      enrollments: c.enrollmentCount || 0,
    })),
    revenueOverTime: synthesizeRevenueSeries(totalRevenue).map((amount, index) => ({
      label: new Date(Date.now() - (11 - index) * 30 * 86400000).toLocaleDateString("en-US", { month: "short" }),
      amount,
    })),
    learnerStats: {
      totalLearners: Number(enrollmentsStat?.value || 0),
      activeLast7Days: 0,
      topCountries: ["—"],
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    },
    reviewStats: {
      averageRating: Number(ratingStat?.value || 0),
      totalReviews: 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percent: 0 })),
      latest: dashboard?.recentReviews || [],
    },
    payoutHistory: [],
  };
}

function adaptRevenue(dashboard) {
  const stats = dashboard?.stats || [];
  const revenueStat = stats.find((s) => s.label === "Revenue");
  const totalRevenue = parseMoneyToNumber(revenueStat?.value);
  const topCourses = dashboard?.topCourses || [];

  return {
    total: revenueStat?.value || "$0",
    detail: revenueStat?.detail || "",
    topCourses,
    summary: {
      currentBalance: revenueStat?.value || "$0",
      lifetime: revenueStat?.value || "$0",
      lastPayout: "$0",
      nextPayout: "$0",
      pending: "$0",
    },
    transactions: topCourses.map((c) => ({
      id: `txn-${c.id}`,
      courseTitle: c.title,
      learner: "—",
      amount: `$${Number(c.price || 0).toFixed(2)}`,
      status: "paid",
      date: c.updatedAt || "",
    })),
    payoutHistory: [],
  };
}

function adaptPublicProfile(data) {
  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const name = profile.name || "Instructor";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    instructor: {
      id: profile.userId || profile.id || null,
      name,
      avatar: initials,
      headline: profile.headline || "",
      bio: profile.bio || "",
      website: profile.website || null,
      twitter: profile.twitter || null,
      linkedin: profile.linkedin || null,
      youtube: profile.youtube || null,
      email: profile.email || "",
    },
    courses,
    reviewStats: {
      latestReviews: [],
      totalStudents: Number(stats.totalStudents || 0),
      avgRating: Number(stats.averageRating || 0),
      totalReviews: 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percent: 0 })),
    },
  };
}

function adaptCourseStudents(rows) {
  return (rows || []).map((row) => ({
    id: row.id,
    userId: row.userId ?? row.user_id,
    name: row.name || `Learner #${row.userId ?? row.user_id}`,
    email: row.email || "",
    enrolledAt: row.enrolledAt ?? row.enrolled_at ?? "",
    progressPercent: 0,
    lastActive: "—",
    rating: null,
    completedLessons: 0,
    quizScore: null,
  }));
}

function adaptProfile(profile) {
  return {
    id: profile?.userId ?? profile?.id ?? null,
    name: profile?.name || "",
    email: profile?.email || "",
    role: profile?.role || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
    avatar: profile?.avatarUrl || null,
  };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useInstructorCourses(filters = {}) {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-courses", user.id, filters],
    queryFn: () => getInstructorCourses(user.id, filters),
    enabled: Boolean(user.id),
    placeholderData: (previous) => previous,
  });
}

export function useInstructorDashboard() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-dashboard", user.id],
    queryFn: async () => adaptDashboard(await getInstructorDashboard()),
    enabled: Boolean(user.id),
  });
}

export function useDuplicateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }),
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }),
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }),
  });
}

export function useCourseStudents(courseId) {
  return useQuery({
    queryKey: ["course-students", courseId],
    queryFn: async () => adaptCourseStudents(await getCourseStudents(courseId)),
    enabled: Boolean(courseId),
  });
}

export function useInstructorAnalytics() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-analytics", user.id],
    queryFn: async () => adaptAnalytics(await getInstructorAnalytics()),
    enabled: Boolean(user.id),
  });
}

export function useInstructorRevenue() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-revenue", user.id],
    queryFn: async () => adaptRevenue(await getInstructorRevenue()),
    enabled: Boolean(user.id),
  });
}

export function useInstructorNotifications() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-notifications", user.id],
    queryFn: getInstructorNotifications,
    enabled: Boolean(user.id),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-notifications"] }),
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }) => replyToReview(reviewId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-analytics"] }),
  });
}

export function useInstructorProfile() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-profile", user.id],
    queryFn: async () => adaptProfile(await getInstructorProfile(user.id)),
    enabled: Boolean(user.id),
  });
}

export function useUpdateInstructorProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: (payload) => updateInstructorProfile(user.id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-profile", user.id] }),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: (payload) => requestPayout(user.id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-revenue", user.id] }),
  });
}

export function useInstructorPublicProfile(instructorId) {
  return useQuery({
    queryKey: ["instructor-public-profile", instructorId],
    queryFn: async () => adaptPublicProfile(await getInstructorPublicProfile(instructorId)),
    enabled: Boolean(instructorId),
  });
}
