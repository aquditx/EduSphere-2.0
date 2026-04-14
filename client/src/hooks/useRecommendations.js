import { useEffect, useMemo } from "react";
import { seedCourses } from "@/data/mockData.js";

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

const publishedCourses = () => seedCourses.filter((course) => course.status === "approved");

export function useTrendingCourses(limit = 8) {
  return useMemo(
    () =>
      publishedCourses()
        .slice()
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0) || (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
        .slice(0, limit),
    [limit]
  );
}

export function useTopRatedCourses(limit = 8) {
  return useMemo(
    () =>
      publishedCourses()
        .filter((course) => (course.ratingAverage || 0) >= 4.5)
        .slice()
        .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0) || (b.ratingCount || 0) - (a.ratingCount || 0))
        .slice(0, limit),
    [limit]
  );
}

export function useNewReleases(limit = 8) {
  return useMemo(
    () =>
      publishedCourses()
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit),
    [limit]
  );
}

export function useSimilarCourses(courseId, limit = 4) {
  return useMemo(() => {
    const base = seedCourses.find((course) => course.id === courseId);
    if (!base) return [];
    const baseSkills = new Set((base.skills || []).map((skill) => skill.toLowerCase()));
    return publishedCourses()
      .filter((course) => course.id !== courseId)
      .map((course) => {
        const skillOverlap = (course.skills || []).reduce(
          (count, skill) => count + (baseSkills.has(skill.toLowerCase()) ? 1 : 0),
          0
        );
        const sameCategory = course.category === base.category ? 3 : 0;
        const sameLevel = course.level === base.level ? 1 : 0;
        const ratingBoost = (course.ratingAverage || 0) >= 4.5 ? 1 : 0;
        const score = sameCategory + skillOverlap * 2 + sameLevel + ratingBoost;
        return { course, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (b.course.enrollmentCount || 0) - (a.course.enrollmentCount || 0))
      .slice(0, limit)
      .map((entry) => entry.course);
  }, [courseId, limit]);
}

export function useAlsoEnrolled(courseId, limit = 4) {
  return useMemo(() => {
    const base = seedCourses.find((course) => course.id === courseId);
    if (!base) return [];
    return publishedCourses()
      .filter((course) => course.id !== courseId)
      .map((course) => {
        const sameInstructor = course.instructorId === base.instructorId ? 3 : 0;
        const sameCategory = course.category === base.category ? 2 : 0;
        const popularityBoost = Math.min(2, Math.floor((course.enrollmentCount || 0) / 10000));
        return { course, score: sameInstructor + sameCategory + popularityBoost };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (b.course.ratingAverage || 0) - (a.course.ratingAverage || 0))
      .slice(0, limit)
      .map((entry) => entry.course);
  }, [courseId, limit]);
}

export function usePersonalizedCourses(limit = 8) {
  return useMemo(() => {
    const history = readHistory();
    if (history.length === 0) {
      // No history — fall back to trending.
      return publishedCourses()
        .slice()
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
        .slice(0, limit);
    }

    const historyIds = new Set(history.map((entry) => entry.courseId));
    const viewedCourses = history
      .map((entry) => seedCourses.find((course) => course.id === entry.courseId))
      .filter(Boolean);

    // Build a category preference map weighted by recency.
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

    return publishedCourses()
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
  }, [limit]);
}
