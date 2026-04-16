import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getCourses } from "@/api/courseApi.js";

const HISTORY_KEY = "EduSphere-view-history";
const MAX_HISTORY = 20;

function readHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(history) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

export function trackCourseView(courseId) {
  if (!courseId) return;
  const history = readHistory().filter((entry) => entry.courseId !== courseId);
  history.unshift({ courseId, viewedAt: Date.now() });
  writeHistory(history.slice(0, MAX_HISTORY));
}

export function useTrackCourseView(courseId) {
  useEffect(() => {
    if (courseId) trackCourseView(courseId);
  }, [courseId]);
}

// --- Recommendation rails (React Query hitting the real courses API) ---

function useRail(queryKey, filters, limit) {
  return useQuery({
    queryKey: [...queryKey, limit],
    queryFn: async () => {
      const response = await getCourses({ ...filters, page: 1, pageSize: limit });
      return response?.items || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useTrendingCourses(limit = 8) {
  const query = useRail(["recommendations", "trending"], { sort: "trending" }, limit);
  return query.data || [];
}

export function useTopRatedCourses(limit = 8) {
  const query = useRail(["recommendations", "top-rated"], { sort: "highest-rated", rating: "4.5" }, limit);
  return query.data || [];
}

export function useNewReleases(limit = 8) {
  const query = useRail(["recommendations", "newest"], { sort: "newest" }, limit);
  return query.data || [];
}

// --- Contextual recommendations (fetch a pool by category then rank client-side) ---

export function useSimilarCourses(courseId, limit = 4) {
  const { data: currentCourseList } = useQuery({
    queryKey: ["recommendations", "similar-anchor", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await getCourses({ page: 1, pageSize: 1 });
      return response;
    },
    enabled: Boolean(courseId),
  });

  // We need the anchor course to know its category/skills, but the easiest path
  // is to let the parent page's useCourse() hook supply that via React Query
  // cache. Here, we just fetch the largest pool and rank the frontend way.
  const { data: pool } = useQuery({
    queryKey: ["recommendations", "similar-pool"],
    queryFn: async () => {
      const response = await getCourses({ sort: "trending", page: 1, pageSize: 60 });
      return response?.items || [];
    },
    staleTime: 60 * 1000,
  });

  return useMemo(() => {
    if (!pool || !courseId) return [];
    const anchor = pool.find((course) => course.id === courseId);
    if (!anchor) return pool.filter((course) => course.id !== courseId).slice(0, limit);

    const anchorSkills = new Set((anchor.skills || []).map((skill) => skill.toLowerCase()));
    return pool
      .filter((course) => course.id !== courseId)
      .map((course) => {
        const skillOverlap = (course.skills || []).reduce(
          (count, skill) => count + (anchorSkills.has(skill.toLowerCase()) ? 1 : 0),
          0
        );
        const sameCategory = course.category === anchor.category ? 3 : 0;
        const sameLevel = course.level === anchor.level ? 1 : 0;
        const ratingBoost = (course.ratingAverage || 0) >= 4.5 ? 1 : 0;
        return { course, score: sameCategory + skillOverlap * 2 + sameLevel + ratingBoost };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (b.course.enrollmentCount || 0) - (a.course.enrollmentCount || 0))
      .slice(0, limit)
      .map((entry) => entry.course);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, courseId, limit, currentCourseList]);
}

export function useAlsoEnrolled(courseId, limit = 4) {
  const { data: pool } = useQuery({
    queryKey: ["recommendations", "also-enrolled-pool"],
    queryFn: async () => {
      const response = await getCourses({ sort: "most-popular", page: 1, pageSize: 60 });
      return response?.items || [];
    },
    staleTime: 60 * 1000,
  });

  return useMemo(() => {
    if (!pool || !courseId) return [];
    const anchor = pool.find((course) => course.id === courseId);
    if (!anchor) return pool.filter((course) => course.id !== courseId).slice(0, limit);

    return pool
      .filter((course) => course.id !== courseId)
      .map((course) => {
        const sameInstructor = course.instructorId === anchor.instructorId ? 3 : 0;
        const sameCategory = course.category === anchor.category ? 2 : 0;
        const popularityBoost = Math.min(2, Math.floor((course.enrollmentCount || 0) / 10000));
        return { course, score: sameInstructor + sameCategory + popularityBoost };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (b.course.ratingAverage || 0) - (a.course.ratingAverage || 0))
      .slice(0, limit)
      .map((entry) => entry.course);
  }, [pool, courseId, limit]);
}

export function usePersonalizedCourses(limit = 8) {
  const { data: pool } = useQuery({
    queryKey: ["recommendations", "personalized-pool"],
    queryFn: async () => {
      const response = await getCourses({ sort: "trending", page: 1, pageSize: 60 });
      return response?.items || [];
    },
    staleTime: 60 * 1000,
  });

  return useMemo(() => {
    if (!pool) return [];
    const history = readHistory();
    const historyIds = new Set(history.map((entry) => entry.courseId));
    const viewedCourses = history
      .map((entry) => pool.find((course) => course.id === entry.courseId))
      .filter(Boolean);

    if (viewedCourses.length === 0) {
      return pool.slice(0, limit);
    }

    const categoryWeights = new Map();
    const skillWeights = new Map();
    viewedCourses.forEach((course, index) => {
      const recencyBoost = 1 / (index + 1);
      categoryWeights.set(course.category, (categoryWeights.get(course.category) || 0) + recencyBoost);
      (course.skills || []).forEach((skill) => {
        const key = skill.toLowerCase();
        skillWeights.set(key, (skillWeights.get(key) || 0) + recencyBoost * 0.5);
      });
    });

    return pool
      .filter((course) => !historyIds.has(course.id))
      .map((course) => {
        const categoryBoost = (categoryWeights.get(course.category) || 0) * 4;
        const skillBoost = (course.skills || []).reduce(
          (total, skill) => total + (skillWeights.get(skill.toLowerCase()) || 0),
          0
        );
        const popularity = (course.trendingScore || 0) / 100;
        return { course, score: categoryBoost + skillBoost + popularity };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.course);
  }, [pool, limit]);
}
