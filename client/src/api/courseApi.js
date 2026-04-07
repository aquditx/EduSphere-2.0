import { apiClient } from "./client.js";

export function getCourses(params) {
  return apiClient.get("/courses", { params });
}

export function getCourseById(courseId) {
  return apiClient.get(`/courses/${courseId}`);
}

export function enroll(courseId, userId, lessonId) {
  return apiClient.post("/enroll", { courseId, userId, lessonId });
}

export function submitReview(payload) {
  return apiClient.post("/reviews", payload);
}

export function createCourse(payload) {
  return apiClient.post("/courses", payload);
}

export function updateCourse(courseId, payload) {
  return apiClient.patch(`/courses/${courseId}`, payload);
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

export function deleteCourse(courseId) {
  return apiClient.delete(`/courses/${courseId}`);
}

