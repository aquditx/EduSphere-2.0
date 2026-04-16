import { apiClient } from "./client.js";

const BASE_URL = "http://localhost:8000/api";

// Hits courses-service GET /enrollments (proxied via gateway) with the bearer
// token. The backend reads user_id from the token when no ?userId is passed.
export function getEnrollments(userId) {
  return apiClient.get("/enrollments", { params: { userId } });
}

// Getting progress
export async function getProgress(userId, courseId) {
  const res = await fetch(
    `${BASE_URL}/progress?userId=${userId}&courseId=${courseId}`
  );
  return res.json();
}

// post progress data
export async function updateProgress(
  courseId,
  lessonId,
  userId,
  nextLessonId,
  timeWatched
) {
  const res = await fetch(`${BASE_URL}/progress/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      courseId,
      lessonId,
      userId,
      nextLessonId,
      timeWatched,
    }),
  });

  return res.json();
}

// 
export async function saveWatchTime(
  courseId,
  lessonId,
  userId,
  timeWatched
) {
  const res = await fetch(`${BASE_URL}/progress/watch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      courseId,
      lessonId,
      userId,
      timeWatched,
    }),
  });

  return res.json();
}

//  Posting quiz results 
export async function submitQuiz(payload) {
  const res = await fetch(`${BASE_URL}/progress/quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

// quiz set this up after course microservice 
export async function generateAiQuiz(lessonTitle, lessonContent) {
  const res = await fetch(`${BASE_URL}/progress/generate-quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lessonTitle,
      lessonContent,
    }),
  });

  return res.json();
}