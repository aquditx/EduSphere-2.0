import { apiClient } from "./client.js";

export function getPaymentStatus(userId, courseId) {
  return apiClient.get("/payments/status", { params: { userId, courseId } });
}

export function completeCheckout(payload) {
  return apiClient.post("/payments/checkout", payload);
}
