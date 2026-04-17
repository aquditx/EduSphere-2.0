import { apiClient } from "./client.js";

// All progress calls now route through apiClient, which uses the localStorage
// mock. This ensures reads and writes are consistent — "mark complete" actually
// persists and shows up on refetch without needing the real progress-tracker
// service running. When you're ready to wire the real backend, swap apiClient
// for fetch calls to http://localhost:8000/api/progress/*.

export function getEnrollments(userId) {
  return apiClient.get("/enrollments", { params: { userId } });
}

export function getProgress(userId, courseId) {
  return apiClient.get("/progress", { params: { userId, courseId } });
}

export function updateProgress(courseId, lessonId, userId, nextLessonId, timeWatched) {
  return apiClient.post("/progress/complete", { courseId, lessonId, userId, nextLessonId, timeWatched });
}

export function saveWatchTime(courseId, lessonId, userId, timeWatched) {
  return apiClient.post("/progress/watch", { courseId, lessonId, userId, timeWatched });
}

export function submitQuiz(payload) {
  return apiClient.post("/progress/quiz", payload);
}

export function generateAiQuiz(lessonTitle, lessonContent) {
  return apiClient.post("/progress/generate-quiz", { lessonTitle, lessonContent });
}
