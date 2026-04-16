import { useMutation } from "@tanstack/react-query";
import { login, signup } from "@/api/userApi.js";
import { useAuthStore } from "@/store/authStore.js";

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function adaptAuthResponse(data) {
  // auth_login login:    { token, user_id, role, name, email }
  // auth_login register: { user_id, role }  (no token — caller must log in next)
  const token = data.token || null;
  const user = {
    id: data.user_id ?? data.id ?? null,
    name: data.name || "Learner",
    email: data.email || "",
    role: data.role || "student",
    avatar: initials(data.name || "Learner"),
    headline: data.headline || "",
  };
  return { token, user };
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => setSession(adaptAuthResponse(data)),
  });
}

export function useSignup() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload) => {
      // Register first, then log in to get a session token in one call from the UI's POV.
      await signup(payload);
      const loginResponse = await login({ email: payload.email, password: payload.password });
      return loginResponse;
    },
    onSuccess: (data) => setSession(adaptAuthResponse(data)),
  });
}
