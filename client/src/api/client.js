import { seedCourses, seedEnrollments, seedProgress, seedReports, seedUsers } from "@/data/mockData.js";

const STORAGE_KEY = "novalearn-lms-db";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  return {
    users: clone(seedUsers),
    courses: clone(seedCourses),
    enrollments: clone(seedEnrollments),
    progress: clone(seedProgress),
    reports: clone(seedReports),
  };
}

function loadDb() {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const initial = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveDb(db) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  return db;
}

function withDb(mutator) {
  const current = loadDb();
  const next = mutator(clone(current));
  return clone(saveDb(next));
}

function wait(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function flattenLessons(course) {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson, index) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
      order: index,
    }))
  );
}

function getCourseRuntime(course) {
  const lessons = flattenLessons(course);
  return {
    ...course,
    lessons,
    totalLessons: lessons.length,
    durationLabel: `${Math.floor(course.durationMinutes / 60)}h ${course.durationMinutes % 60}m`,
  };
}

function ratingFilter(course, minRating) {
  if (!minRating) return true;
  return course.ratingAverage >= Number(minRating);
}

function durationFilter(course, duration) {
  if (!duration || duration === "All") return true;
  if (duration === "Short") return course.durationMinutes < 300;
  if (duration === "Medium") return course.durationMinutes >= 300 && course.durationMinutes < 900;
  return course.durationMinutes >= 900;
}

function sortCourses(courses, sort) {
  const items = [...courses];
  if (sort === "newest") {
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (sort === "highest-rated") {
    return items.sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount);
  }
  return items.sort((a, b) => b.trendingScore - a.trendingScore || b.enrollmentCount - a.enrollmentCount);
}

function buildDashboard(db, userId) {
  const enrollments = db.enrollments.filter((item) => item.userId === userId);
  const progressEntries = db.progress.filter((item) => item.userId === userId);
  const enrolledCourses = enrollments
    .map((enrollment) => db.courses.find((course) => course.id === enrollment.courseId))
    .filter(Boolean)
    .map(getCourseRuntime);

  const continueLearning = enrolledCourses.map((course) => {
    const progress = progressEntries.find((entry) => entry.courseId === course.id);
    const percent = progress ? Math.round((progress.completedLessonIds.length / course.totalLessons) * 100) : 0;
    return {
      ...course,
      progressPercent: percent,
      resumeLessonId: progress?.lastLessonId || course.lessons[0]?.id,
    };
  });

  const heroCourse = continueLearning[0] || null;
  const completedLessons = progressEntries.reduce((total, entry) => total + entry.completedLessonIds.length, 0);
  const totalMinutes = progressEntries.reduce((total, entry) => {
    return total + Object.values(entry.lessonTimes || {}).reduce((sum, seconds) => sum + Math.round(seconds / 60), 0);
  }, 0);

  return {
    heroCourse,
    continueLearning,
    stats: [
      { label: "Active enrollments", value: String(enrollments.length), detail: `${completedLessons} lessons completed` },
      { label: "Hours watched", value: `${(totalMinutes / 60).toFixed(1)}h`, detail: "Across all enrolled courses" },
      { label: "Average score", value: "94%", detail: "Latest lesson quiz results" },
      { label: "Certificates", value: "2", detail: "Issued this quarter" },
    ],
    activity: progressEntries
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((entry) => {
        const course = enrolledCourses.find((item) => item.id === entry.courseId);
        const lesson = course?.lessons.find((item) => item.id === entry.lastLessonId);
        return {
          id: entry.id,
          title: lesson ? `Last watched ${lesson.title}` : "Progress updated",
          detail: course?.title || "Course progress",
          time: new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
      }),
  };
}

function buildInstructorDashboard(db, userId) {
  const courses = db.courses.filter((course) => course.instructorId === userId).map(getCourseRuntime);
  const enrollments = db.enrollments.filter((item) => courses.some((course) => course.id === item.courseId));
  const revenue = courses.reduce((total, course) => {
    const count = enrollments.filter((item) => item.courseId === course.id).length;
    return total + count * course.price;
  }, 0);

  return {
    stats: [
      { label: "Managed courses", value: String(courses.length), detail: "Draft and live catalog" },
      { label: "Enrollments", value: String(enrollments.length), detail: "Across your catalog" },
      { label: "Revenue", value: `$${revenue.toLocaleString()}`, detail: "Gross course sales" },
      {
        label: "Approval status",
        value: `${courses.filter((course) => course.status === "approved").length}/${courses.length}`,
        detail: "Approved courses",
      },
    ],
    courses,
    revenueSeries: db.reports.revenueSeries,
  };
}

function buildAdminDashboard(db) {
  return {
    stats: [
      { label: "Users", value: String(db.users.length), detail: `${db.users.filter((user) => user.role === "student").length} students` },
      { label: "Courses", value: String(db.courses.length), detail: `${db.courses.filter((course) => course.status === "approved").length} approved` },
      { label: "Enrollments", value: String(db.enrollments.length), detail: "Across the platform" },
      { label: "Completion", value: `${db.reports.completionRate}%`, detail: "Platform completion rate" },
    ],
    analytics: db.reports,
  };
}

async function handleGet(path, params = {}) {
  const db = loadDb();

  if (path === "/courses") {
    const { page = 1, pageSize = 6, search = "", category = "All", level = "All", duration = "All", rating = "", sort = "trending", status = "approved", instructorId } = params;
    let courses = db.courses.filter((course) => (status === "all" ? true : course.status === status));
    if (instructorId) {
      courses = courses.filter((course) => course.instructorId === instructorId);
    }
    const normalizedSearch = String(search).trim().toLowerCase();
    courses = courses.filter((course) => {
      const matchesSearch = !normalizedSearch || course.title.toLowerCase().includes(normalizedSearch) || course.description.toLowerCase().includes(normalizedSearch);
      const matchesCategory = category === "All" || course.category === category;
      const matchesLevel = level === "All" || course.level === level;
      return matchesSearch && matchesCategory && matchesLevel && durationFilter(course, duration) && ratingFilter(course, rating);
    });
    const sorted = sortCourses(courses, sort).map(getCourseRuntime);
    const offset = (Number(page) - 1) * Number(pageSize);
    const items = sorted.slice(offset, offset + Number(pageSize));
    return {
      items,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        totalItems: sorted.length,
        totalPages: Math.max(1, Math.ceil(sorted.length / Number(pageSize))),
        hasMore: offset + Number(pageSize) < sorted.length,
      },
    };
  }

  if (path.startsWith("/courses/")) {
    const courseId = path.split("/")[2];
    const course = db.courses.find((item) => item.id === courseId || item.slug === courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    return getCourseRuntime(course);
  }

  if (path === "/enrollments") {
    const { userId } = params;
    return db.enrollments.filter((item) => item.userId === userId);
  }

  if (path === "/progress") {
    const { userId, courseId } = params;
    return db.progress.find((item) => item.userId === userId && item.courseId === courseId) || null;
  }

  if (path === "/dashboard/student") {
    return buildDashboard(db, params.userId);
  }

  if (path === "/dashboard/instructor") {
    return buildInstructorDashboard(db, params.userId);
  }

  if (path === "/dashboard/admin") {
    return buildAdminDashboard(db);
  }

  if (path === "/users") {
    const { role = "all", search = "" } = params;
    return db.users.filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const normalizedSearch = String(search).trim().toLowerCase();
      const matchesSearch = !normalizedSearch || user.name.toLowerCase().includes(normalizedSearch) || user.email.toLowerCase().includes(normalizedSearch);
      return matchesRole && matchesSearch;
    });
  }

  throw new Error(`Unknown GET path: ${path}`);
}

async function handlePost(path, body = {}) {
  if (path === "/auth/login") {
    const db = loadDb();
    const user = db.users.find((item) => item.email.toLowerCase() === body.email.toLowerCase() && item.password === body.password);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return {
      token: `token-${user.id}`,
      user: { ...user, password: undefined },
    };
  }

  if (path === "/auth/signup") {
    const db = withDb((draft) => {
      if (draft.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) {
        throw new Error("Account already exists");
      }
      const nextUser = {
        id: `user-${Date.now()}`,
        name: body.name,
        email: body.email,
        password: body.password,
        role: "student",
        headline: "New learner",
        avatar: body.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      };
      draft.users.unshift(nextUser);
      return draft;
    });
    const user = db.users[0];
    return {
      token: `token-${user.id}`,
      user: { ...user, password: undefined },
    };
  }

  if (path === "/enroll") {
    return withDb((draft) => {
      const exists = draft.enrollments.find((item) => item.userId === body.userId && item.courseId === body.courseId);
      if (!exists) {
        draft.enrollments.unshift({
          id: `enrollment-${Date.now()}`,
          userId: body.userId,
          courseId: body.courseId,
          enrolledAt: new Date().toISOString(),
        });
        draft.progress.unshift({
          id: `progress-${Date.now()}`,
          userId: body.userId,
          courseId: body.courseId,
          lastLessonId: body.lessonId,
          completedLessonIds: [],
          lessonTimes: {},
          quizResults: {},
          updatedAt: new Date().toISOString(),
        });
      }
      return draft;
    }).enrollments[0];
  }

  if (path === "/reviews") {
    const db = withDb((draft) => {
      const course = draft.courses.find((item) => item.id === body.courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      const review = {
        id: `review-${Date.now()}`,
        userId: body.userId,
        userName: body.userName,
        rating: Number(body.rating),
        comment: body.comment,
        createdAt: new Date().toISOString(),
      };
      course.reviews.unshift(review);
      const average = course.reviews.reduce((sum, item) => sum + item.rating, 0) / course.reviews.length;
      course.ratingAverage = Number(average.toFixed(1));
      course.ratingCount = course.reviews.length;
      course.updatedAt = new Date().toISOString();
      return draft;
    });
    const course = db.courses.find((item) => item.id === body.courseId);
    return getCourseRuntime(course);
  }

  if (path === "/progress/complete") {
    const db = withDb((draft) => {
      const progress = draft.progress.find((item) => item.userId === body.userId && item.courseId === body.courseId);
      if (!progress) {
        throw new Error("Progress record not found");
      }
      if (!progress.completedLessonIds.includes(body.lessonId)) {
        progress.completedLessonIds.push(body.lessonId);
      }
      progress.lastLessonId = body.nextLessonId || body.lessonId;
      progress.lessonTimes[body.lessonId] = body.timeWatched || progress.lessonTimes[body.lessonId] || 0;
      progress.updatedAt = new Date().toISOString();
      return draft;
    });
    return db.progress.find((item) => item.userId === body.userId && item.courseId === body.courseId);
  }

  if (path === "/progress/watch") {
    const db = withDb((draft) => {
      const progress = draft.progress.find((item) => item.userId === body.userId && item.courseId === body.courseId);
      if (!progress) {
        throw new Error("Progress record not found");
      }
      progress.lastLessonId = body.lessonId;
      progress.lessonTimes[body.lessonId] = Math.max(progress.lessonTimes[body.lessonId] || 0, Math.round(body.timeWatched || 0));
      progress.updatedAt = new Date().toISOString();
      return draft;
    });
    return db.progress.find((item) => item.userId === body.userId && item.courseId === body.courseId);
  }

  if (path === "/progress/quiz") {
    const db = withDb((draft) => {
      const progress = draft.progress.find((item) => item.userId === body.userId && item.courseId === body.courseId);
      if (!progress) {
        throw new Error("Progress record not found");
      }
      progress.quizResults[body.lessonId] = {
        score: body.score,
        answers: body.answers,
      };
      progress.updatedAt = new Date().toISOString();
      return draft;
    });
    return db.progress.find((item) => item.userId === body.userId && item.courseId === body.courseId);
  }

  if (path === "/courses") {
    const db = withDb((draft) => {
      const course = {
        id: `course-${Date.now()}`,
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        category: body.category,
        level: body.level,
        durationMinutes: Number(body.durationMinutes || 0),
        ratingAverage: 0,
        ratingCount: 0,
        enrollmentCount: 0,
        price: Number(body.price || 0),
        status: body.status || "draft",
        trendingScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail: body.thumbnail,
        accent: body.accent,
        instructorId: body.instructorId,
        instructorName: body.instructorName,
        instructorHeadline: body.instructorHeadline,
        modules: body.modules,
        outcomes: body.outcomes,
        reviews: [],
      };
      draft.courses.unshift(course);
      return draft;
    });
    return getCourseRuntime(db.courses[0]);
  }

  throw new Error(`Unknown POST path: ${path}`);
}

async function handlePatch(path, body = {}) {
  if (path.startsWith("/courses/")) {
    const courseId = path.split("/")[2];
    const db = withDb((draft) => {
      const course = draft.courses.find((item) => item.id === courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      Object.assign(course, body, { updatedAt: new Date().toISOString() });
      return draft;
    });
    const course = db.courses.find((item) => item.id === courseId);
    return getCourseRuntime(course);
  }

  if (path.startsWith("/users/")) {
    const userId = path.split("/")[2];
    const db = withDb((draft) => {
      const user = draft.users.find((item) => item.id === userId);
      if (!user) {
        throw new Error("User not found");
      }
      Object.assign(user, body);
      return draft;
    });
    return db.users.find((item) => item.id === userId);
  }

  throw new Error(`Unknown PATCH path: ${path}`);
}

async function handleDelete(path) {
  if (path.startsWith("/courses/")) {
    const courseId = path.split("/")[2];
    withDb((draft) => {
      draft.courses = draft.courses.filter((item) => item.id !== courseId);
      draft.enrollments = draft.enrollments.filter((item) => item.courseId !== courseId);
      draft.progress = draft.progress.filter((item) => item.courseId !== courseId);
      return draft;
    });
    return { success: true };
  }

  throw new Error(`Unknown DELETE path: ${path}`);
}

async function request(method, path, payload) {
  await wait();
  if (method === "GET") return handleGet(path, payload);
  if (method === "POST") return handlePost(path, payload);
  if (method === "PATCH") return handlePatch(path, payload);
  if (method === "DELETE") return handleDelete(path, payload);
  throw new Error(`Unsupported method: ${method}`);
}

export const apiClient = {
  get: (path, { params } = {}) => request("GET", path, params),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
  reset: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
};

