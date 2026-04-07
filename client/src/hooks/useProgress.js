import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEnrollments, getProgress, saveWatchTime, submitQuiz, updateProgress } from "@/api/progressApi.js";
import { useAuthStore } from "@/store/authStore.js";

export function useEnrollments() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["enrollments", user.id],
    queryFn: () => getEnrollments(user.id),
    enabled: Boolean(user.id),
  });
}

export function useCourseProgress(courseId) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["progress", user.id, courseId],
    queryFn: () => getProgress(user.id, courseId),
    enabled: Boolean(user.id && courseId),
  });
}

export function useMarkLessonComplete(courseId) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ lessonId, nextLessonId, timeWatched }) =>
      updateProgress(courseId, lessonId, user.id, nextLessonId, timeWatched),
    onMutate: async ({ lessonId, nextLessonId, timeWatched }) => {
      await queryClient.cancelQueries({ queryKey: ["progress", user.id, courseId] });
      const previous = queryClient.getQueryData(["progress", user.id, courseId]);
      if (previous) {
        queryClient.setQueryData(["progress", user.id, courseId], {
          ...previous,
          completedLessonIds: previous.completedLessonIds.includes(lessonId)
            ? previous.completedLessonIds
            : [...previous.completedLessonIds, lessonId],
          lastLessonId: nextLessonId || lessonId,
          lessonTimes: {
            ...previous.lessonTimes,
            [lessonId]: timeWatched,
          },
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["progress", user.id, courseId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", user.id, courseId] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard", user.id] });
    },
  });
}

export function useSaveWatchTime(courseId) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ lessonId, timeWatched }) => saveWatchTime(courseId, lessonId, user.id, timeWatched),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress", user.id, courseId] }),
  });
}

export function useSubmitQuiz(courseId) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ lessonId, score, answers }) => submitQuiz({ courseId, lessonId, userId: user.id, score, answers }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress", user.id, courseId] }),
  });
}

