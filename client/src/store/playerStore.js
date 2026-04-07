import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  lessonId: null,
  playbackRate: 1,
  captionsEnabled: true,
  setLessonId: (lessonId) => set({ lessonId }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setCaptionsEnabled: (captionsEnabled) => set({ captionsEnabled }),
}));

