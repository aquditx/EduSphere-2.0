import { apiClient } from "./client.js";

export function login(payload) {
  return apiClient.post("/auth/login", payload);
}

export function signup(payload) {
  return apiClient.post("/auth/signup", payload);
}

export function getUsers(params) {
  return apiClient.get("/users", { params });
}

export function updateUser(userId, payload) {
  return apiClient.patch(`/users/${userId}`, payload);
}

export function getStudentDashboard(userId) {
  return apiClient.get("/dashboard/student", { params: { userId } });
}

export function getInstructorDashboard(userId) {
  return apiClient.get("/dashboard/instructor", { params: { userId } });
}

export function getAdminDashboard() {
  return apiClient.get("/dashboard/admin");
}

