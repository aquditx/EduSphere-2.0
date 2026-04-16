// Payments are intentionally mocked — we don't ship a real Stripe integration
// yet. This module stores payment records in localStorage so the checkout
// flow feels real and idempotent within one browser. The SIDE EFFECT of a
// successful payment is a real enrollment written to courses-service.
//
// When you're ready to wire a real payment processor, swap this file's
// implementation for real fetch calls. The function signatures are stable.

import { apiClient } from "./client.js";

const STORAGE_KEY = "EduSphere-payments";

function loadPayments() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePayments(payments) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

// Returns { payment } if a successful payment exists for this user+course, else null.
export async function getPaymentStatus(userId, courseId) {
  const payment = loadPayments().find(
    (entry) => entry.userId === userId && entry.courseId === courseId && entry.status === "success"
  );
  return payment ? { payment } : null;
}

// Returns { payment, enrolled }. Throws if the real enrollment call fails
// (except for 409 "already enrolled", which is still a success).
export async function completeCheckout(payload) {
  const { courseId, userId, amount, lessonId, method = "card" } = payload;

  // Fake processing delay so the "Verifying payment..." state is visible.
  await new Promise((resolve) => setTimeout(resolve, 450));

  const payment = {
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    transactionId: `txn-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    userId,
    courseId,
    amount,
    method,
    status: "success",
    createdAt: new Date().toISOString(),
  };

  // Hit the REAL courses-service enrollment endpoint. If it fails, the whole
  // checkout fails — we don't want to pretend payment succeeded when no
  // enrollment was actually created on the backend.
  let alreadyEnrolled = false;
  try {
    await apiClient.post(`/courses/${courseId}/enroll`, { lessonId });
  } catch (err) {
    if (err?.status === 409) {
      alreadyEnrolled = true;
    } else {
      // Surface the error to React Query so the UI shows it.
      const message = err?.message || "Failed to enroll after payment";
      const wrapped = new Error(`Payment recorded but enrollment failed: ${message}`);
      wrapped.status = err?.status;
      wrapped.payload = err?.payload;
      throw wrapped;
    }
  }

  // Only persist the payment after the enrollment side-effect succeeded.
  const payments = loadPayments();
  payments.push(payment);
  savePayments(payments);

  return { payment, enrolled: !alreadyEnrolled };
}
