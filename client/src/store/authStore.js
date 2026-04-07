import { create } from "zustand";
import { persist } from "zustand/middleware";

const guestUser = {
  id: null,
  name: "Guest Learner",
  email: "guest@EduSphere.app",
  role: "guest",
  headline: "Explore the catalog before enrolling",
  avatar: "GL",
};

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: guestUser,
      setSession: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: guestUser }),
    }),
    {
      name: "EduSphere-auth",
    }
  )
);

