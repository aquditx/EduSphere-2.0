import { apiClient } from "./client.js";

export function getEnrollments(userId) {
  return apiClient.get("/enrollments", { params: { userId } });
}

export function getProgress(userId, courseId) {
  return apiClient.get("/progress", { params: { userId, courseId } });
}

export function updateProgress(courseId, lessonId, userId, nextLessonId, timeWatched) {
  return apiClient.post("/progress/complete", {
    courseId,
    lessonId,
    userId,
    nextLessonId,
    timeWatched,
  });
}

export function saveWatchTime(courseId, lessonId, userId, timeWatched) {
  return apiClient.post("/progress/watch", {
    courseId,
    lessonId,
    userId,
    timeWatched,
  });
}

export function submitQuiz(payload) {
  return apiClient.post("/progress/quiz", payload);
}

