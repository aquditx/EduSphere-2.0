import { apiClient } from "./client.js";

export function getInstructorDashboard(instructorId) {
  return apiClient.get("/dashboard/instructor", { params: { userId: instructorId } });
}

export function getInstructorCourses(instructorId, filters = {}) {
  return apiClient.get("/courses", { params: { instructorId, ...filters } });
}

export function duplicateCourse(courseId) {
  return apiClient.post(`/courses/${courseId}/duplicate`);
}

export function publishCourse(courseId) {
  return apiClient.post(`/courses/${courseId}/publish`);
}

export function archiveCourse(courseId) {
  return apiClient.post(`/courses/${courseId}/archive`);
}

export function getCourseStudents(courseId) {
  return apiClient.get(`/courses/${courseId}/students`);
}

export function getInstructorAnalytics(instructorId, params = {}) {
  return apiClient.get("/dashboard/instructor/analytics", { params: { userId: instructorId, ...params } });
}

export function getInstructorRevenue(instructorId) {
  return apiClient.get("/dashboard/instructor/revenue", { params: { userId: instructorId } });
}

export function getInstructorNotifications(instructorId) {
  return apiClient.get("/instructor/notifications", { params: { userId: instructorId } });
}

export function markNotificationRead(notificationId) {
  return apiClient.patch(`/notifications/${notificationId}/read`);
}

export function replyToReview(reviewId, payload) {
  return apiClient.post(`/reviews/${reviewId}/reply`, payload);
}

export function getInstructorProfile(instructorId) {
  return apiClient.get(`/instructors/${instructorId}`);
}

export function updateInstructorProfile(instructorId, payload) {
  return apiClient.patch(`/instructors/${instructorId}`, payload);
}

export function requestPayout(instructorId, payload) {
  return apiClient.post(`/instructor/${instructorId}/payout`, payload);
}

export function getInstructorPublicProfile(instructorId) {
  return apiClient.get(`/instructors/${instructorId}/public`);
}
