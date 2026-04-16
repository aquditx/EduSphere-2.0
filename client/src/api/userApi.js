import { apiClient } from "./client.js";

// --- Auth (auth_login service via gateway) ---

export function login(payload) {
  // auth_login returns { token, role, name }
  return apiClient.post("/auth/login", payload);
}

export function signup(payload) {
  // auth_login returns { user_id, role }
  return apiClient.post("/auth/register", payload);
}

// --- Users (auth_login GET /users — not yet implemented on the backend) ---

export function getUsers(params) {
  return apiClient.get("/auth/users", { params });
}

export function updateUser(userId, payload) {
  return apiClient.patch(`/auth/users/${userId}`, payload);
}

// --- Dashboards (courses-service aggregated endpoints) ---

export function getStudentDashboard() {
  return apiClient.get("/courses/dashboard/student");
}

export function getInstructorDashboard() {
  return apiClient.get("/courses/dashboard/instructor");
}

export function getAdminDashboard() {
  return apiClient.get("/courses/dashboard/admin");
}
