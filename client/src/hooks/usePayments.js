import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeCheckout, getPaymentStatus } from "@/api/paymentApi.js";
import { useAuthStore } from "@/store/authStore.js";

export function usePaymentStatus(courseId) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["payment-status", user.id, courseId],
    queryFn: () => getPaymentStatus(user.id, courseId),
    enabled: Boolean(user.id && courseId),
  });
}

export function useCompleteCheckout(courseId) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload) => completeCheckout({ ...payload, userId: user.id, courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-status", user.id, courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", user.id] });
      queryClient.invalidateQueries({ queryKey: ["progress", user.id, courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard", user.id] });
    },
  });
}
