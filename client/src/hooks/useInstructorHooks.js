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
    queryFn: async () => {
      const data = await getInstructorDashboard();
      // Real backend returns: { heroCourse, stats, topCourses, recentEnrollments, recentReviews }
      // Page expects: { stats, courses, revenueSeries (flat number[]), notifications }
      const notifications = [
        ...(data.recentEnrollments || []).map((row) => ({
          id: `enroll-${row.id}`,
          title: "New enrollment",
          description: `A learner enrolled in ${row.courseTitle}`,
          time: row.enrolledAt,
          type: "enrollment",
        })),
        ...(data.recentReviews || []).map((row) => ({
          id: `review-${row.id}`,
          title: `${row.rating}★ review`,
          description: row.comment || `New review on ${row.courseTitle}`,
          time: row.createdAt,
          type: "review",
        })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time));

      const total = parseMoneyToNumber(
        (data.stats || []).find((s) => s.label === "Revenue")?.value
      );
      const revenueSeries = synthesizeRevenueSeries(total);

      return {
        ...data,
        courses: data.topCourses || data.courses || [],
        revenueSeries,
        notifications,
      };
    },
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
    queryFn: () => getCourseStudents(courseId),
    enabled: Boolean(courseId),
  });
}

export function useInstructorAnalytics(params = {}) {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-analytics", user.id, params],
    queryFn: () => getInstructorAnalytics(),
    enabled: Boolean(user.id),
  });
}

export function useInstructorRevenue() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-revenue", user.id],
    queryFn: () => getInstructorRevenue(),
    enabled: Boolean(user.id),
  });
}

export function useInstructorNotifications() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["instructor-notifications", user.id],
    queryFn: () => getInstructorNotifications(),
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
    queryFn: () => getInstructorProfile(user.id),
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
    queryFn: () => getInstructorPublicProfile(instructorId),
    enabled: Boolean(instructorId),
  });
}
