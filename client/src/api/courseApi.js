import { apiClient } from "./client.js";

// --- Public reads ---

export function getCourses(params) {
  return apiClient.get("/courses", { params });
}

export function getCourseById(courseId) {
  return apiClient.get(`/courses/${courseId}`);
}

export function getCourseReviews(courseId) {
  return apiClient.get(`/courses/${courseId}/reviews`);
}

// --- Student actions (courses-service infers user_id from the bearer token) ---

export function enroll(courseId, _userId, lessonId) {
  return apiClient.post(`/courses/${courseId}/enroll`, { lessonId });
}

export function submitReview(payload) {
  const { courseId, rating, comment, userName } = payload;
  return apiClient.post(`/courses/${courseId}/reviews`, {
    rating,
    comment,
    user_name: userName,
  });
}

// --- Instructor CRUD ---

export function createCourse(payload) {
  return apiClient.post("/courses", payload);
}

export function updateCourse(courseId, payload) {
  return apiClient.patch(`/courses/${courseId}`, payload);
}

export function deleteCourse(courseId) {
  return apiClient.delete(`/courses/${courseId}`);
}

// --- Publish / archive / duplicate ---
// These aren't implemented as dedicated routes on courses-service yet —
// they funnel through PATCH /courses/:id with a status change. Duplicate
// is not yet supported by the backend and will throw 404 until a route
// is added.

export function publishCourse(courseId) {
  return apiClient.patch(`/courses/${courseId}`, { status: "approved" });
}

export function archiveCourse(courseId) {
  return apiClient.patch(`/courses/${courseId}`, { status: "rejected" });
}

export function duplicateCourse(courseId) {
  return apiClient.post(`/courses/${courseId}/duplicate`);
}
