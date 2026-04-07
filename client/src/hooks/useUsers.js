import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminDashboard, getInstructorDashboard, getStudentDashboard, getUsers, updateUser } from "@/api/userApi.js";
import { useAuthStore } from "@/store/authStore.js";

export function useStudentDashboard() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["student-dashboard", user.id],
    queryFn: () => getStudentDashboard(user.id),
    enabled: Boolean(user.id),
  });
}

export function useInstructorDashboard() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["instructor-dashboard", user.id],
    queryFn: () => getInstructorDashboard(user.id),
    enabled: Boolean(user.id),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });
}

export function useUsers(filters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

