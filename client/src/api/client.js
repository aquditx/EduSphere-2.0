// Real HTTP client — talks to the API gateway at VITE_API_BASE_URL (default
// http://localhost:8000/api). Attaches Authorization: Bearer <token> from the
// persisted Zustand auth store on every request.
//
// The exported `apiClient` keeps the same .get/.post/.patch/.delete shape as
// the old localStorage mock so consumers don't need to change their imports.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const AUTH_STORAGE_KEY = "EduSphere-auth"; // set by zustand persist in authStore.js

function readToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // zustand/persist shape: { state: { token, user }, version }
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (params && typeof params === "object") {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request(method, path, { params, body, headers = {} } = {}) {
  const token = readToken();
  const finalHeaders = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 / empty body — return nothing.
  if (response.status === 204) return null;

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const apiClient = {
  get: (path, options = {}) => request("GET", path, options),
  post: (path, body, options = {}) => request("POST", path, { ...options, body }),
  patch: (path, body, options = {}) => request("PATCH", path, { ...options, body }),
  put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
  delete: (path, options = {}) => request("DELETE", path, options),
};

export default apiClient;
