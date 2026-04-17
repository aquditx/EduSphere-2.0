import { apiClient } from "./client.js";

// --- Dashboard (courses-service /courses/dashboard/instructor) ---

export function getInstructorDashboard() {
  return apiClient.get("/courses/dashboard/instructor");
}

export async function getInstructorAnalytics() {
  const dashboard = await apiClient.get("/courses/dashboard/instructor");
  return {
    stats: dashboard.stats,
    topCourses: dashboard.topCourses,
    recentEnrollments: dashboard.recentEnrollments,
  };
}

export async function getInstructorRevenue() {
  const dashboard = await apiClient.get("/courses/dashboard/instructor");
  const revenueStat = (dashboard.stats || []).find((s) => s.label === "Revenue");
  return {
    total: revenueStat?.value || "$0",
    detail: revenueStat?.detail || "",
    topCourses: dashboard.topCourses,
  };
}

export async function getInstructorNotifications() {
  const dashboard = await apiClient.get("/courses/dashboard/instructor");
  const enrollments = (dashboard.recentEnrollments || []).map((row) => ({
    id: `enroll-${row.id}`,
    type: "enrollment",
    title: "New enrollment",
    message: `A learner enrolled in ${row.courseTitle}`,
    createdAt: row.enrolledAt,
    read: false,
  }));
  const reviews = (dashboard.recentReviews || []).map((row) => ({
    id: `review-${row.id}`,
    type: "review",
    title: `${row.rating}★ review`,
    message: row.comment || `New review on ${row.courseTitle}`,
    createdAt: row.createdAt,
    read: false,
  }));
  return [...enrollments, ...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// --- Courses ---

export function getInstructorCourses(instructorId, filters = {}) {
  return apiClient.get("/courses", {
    params: { instructorId, status: "all", ...filters },
  });
}

export function duplicateCourse(courseId) {
  return apiClient.post(`/courses/${courseId}/duplicate`);
}

export function publishCourse(courseId) {
  return apiClient.patch(`/courses/${courseId}`, { status: "approved" });
}

export function archiveCourse(courseId) {
  return apiClient.patch(`/courses/${courseId}`, { status: "rejected" });
}

export function getCourseStudents(courseId) {
  return apiClient.get(`/courses/${courseId}/students`);
}

// --- No-ops (resolve locally, swap for real calls when endpoints exist) ---

export async function markNotificationRead(_notificationId) {
  return { ok: true };
}

export async function replyToReview(_reviewId, _payload) {
  return { ok: true };
}

export async function requestPayout(_instructorId, _payload) {
  return { ok: true, status: "pending" };
}

// --- Profile (auth_login /users/:id/profile) ---

export function getInstructorProfile(instructorId) {
  return apiClient.get(`/auth/users/${instructorId}/profile`);
}

export function updateInstructorProfile(instructorId, payload) {
  return apiClient.patch(`/auth/users/${instructorId}/profile`, payload);
}

// --- Public instructor profile (composed from auth + courses) ---

export async function getInstructorPublicProfile(instructorId) {
  const [profile, coursesResponse] = await Promise.all([
    apiClient.get(`/auth/users/${instructorId}/profile`),
    apiClient.get("/courses", { params: { instructorId, status: "approved", pageSize: 20 } }),
  ]);
  const courses = coursesResponse?.items || [];
  const stats = {
    courseCount: courses.length,
    totalStudents: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
    averageRating:
      courses.length > 0
        ? (courses.reduce((sum, c) => sum + (c.ratingAverage || 0), 0) / courses.length).toFixed(1)
        : "0.0",
  };
  return { profile, courses, stats };
}
