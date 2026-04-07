import { useMutation } from "@tanstack/react-query";
import { login, signup } from "@/api/userApi.js";
import { useAuthStore } from "@/store/authStore.js";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => setSession(data),
  });
}

export function useSignup() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => setSession(data),
  });
}

