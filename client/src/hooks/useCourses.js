import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourse,
  deleteCourse,
  enroll,
  getCourseById,
  getCourses,
  submitReview,
  updateCourse,
} from "@/api/courseApi.js";
import { useAuthStore } from "@/store/authStore.js";

export function useCourses(filters) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => getCourses(filters),
    placeholderData: (previous) => previous,
  });
}

export function useCourse(courseId) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: Boolean(courseId),
  });
}

export function usePrefetchCourse() {
  const queryClient = useQueryClient();
  return (courseId) =>
    queryClient.prefetchQuery({
      queryKey: ["course", courseId],
      queryFn: () => getCourseById(courseId),
      staleTime: 1000 * 60 * 5,
    });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ courseId, lessonId }) => enroll(courseId, user.id, lessonId),
    onMutate: async ({ courseId, lessonId }) => {
      await queryClient.cancelQueries({ queryKey: ["enrollments", user.id] });
      const previousEnrollments = queryClient.getQueryData(["enrollments", user.id]) || [];
      const previousProgress = queryClient.getQueryData(["progress", user.id, courseId]);
      queryClient.setQueryData(["enrollments", user.id], [
        {
          id: `optimistic-${courseId}`,
          userId: user.id,
          courseId,
          enrolledAt: new Date().toISOString(),
        },
        ...previousEnrollments,
      ]);
      queryClient.setQueryData(["progress", user.id, courseId], {
        id: `optimistic-progress-${courseId}`,
        userId: user.id,
        courseId,
        lastLessonId: lessonId,
        completedLessonIds: [],
        lessonTimes: {},
        quizResults: {},
        updatedAt: new Date().toISOString(),
      });
      return { previousEnrollments, previousProgress };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(["enrollments", user.id], context?.previousEnrollments || []);
      queryClient.setQueryData(["progress", user.id, variables.courseId], context?.previousProgress || null);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", user.id] });
      queryClient.invalidateQueries({ queryKey: ["progress", user.id, variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard", user.id] });
    },
  });
}

export function useSubmitReview(courseId) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ rating, comment }) =>
      submitReview({
        courseId,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
      }),
    onSuccess: (course) => {
      queryClient.setQueryData(["course", courseId], course);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }) => updateCourse(courseId, payload),
    onSuccess: (course) => {
      queryClient.setQueryData(["course", course.id], course);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

