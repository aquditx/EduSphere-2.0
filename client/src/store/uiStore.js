import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialFilters = {
  search: "",
  category: "All",
  level: "All",
  duration: "All",
  rating: "",
  sort: "trending",
  page: 1,
};

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      courseFilters: initialFilters,
      courseTab: "overview",
      playerSidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setPlayerSidebarOpen: (playerSidebarOpen) => set({ playerSidebarOpen }),
      togglePlayerSidebar: () => set((state) => ({ playerSidebarOpen: !state.playerSidebarOpen })),
      setCourseFilters: (updates) =>
        set((state) => ({
          courseFilters: {
            ...state.courseFilters,
            ...updates,
          },
        })),
      resetCourseFilters: () => set({ courseFilters: initialFilters }),
      setCourseTab: (courseTab) => set({ courseTab }),
    }),
    {
      name: "EduSphere-ui",
    }
  )
);

