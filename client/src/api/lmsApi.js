import { apiRequest } from "./client.js";
import {
  activityFeed,
  authUser,
  catalog,
  instructorCourses,
  instructorStats,
  studentStats,
} from "@/data/mockData.js";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(payload) {
  try {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    await wait();
    return {
      token: "mock-token",
      user: authUser,
    };
  }
}

export async function register(payload) {
  try {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    await wait();
    return {
      token: "mock-token",
      user: {
        ...authUser,
        name: payload.name,
        email: payload.email,
      },
    };
  }
}

export async function fetchStudentDashboard() {
  await wait();
  return {
    heroCourse: catalog[0],
    continueLearning: catalog,
    stats: studentStats,
    activity: activityFeed,
  };
}

export async function fetchCourses() {
  await wait();
  return catalog;
}

export async function fetchCourseById(courseId) {
  await wait();
  return catalog.find((course) => course.id === courseId) || catalog[0];
}

export async function fetchInstructorDashboard() {
  await wait();
  return {
    stats: instructorStats,
    courses: instructorCourses,
  };
}

