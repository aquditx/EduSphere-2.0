import { seedCourses, seedEnrollments, seedProgress, seedReports, seedUsers } from "@/data/mockData.js";

const STORAGE_KEY = "EduSphere-lms-db-v2";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  return {
    users: clone(seedUsers),
    courses: clone(seedCourses),
    enrollments: clone(seedEnrollments),
    progress: clone(seedProgress),
    payments: [],
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
    const parsed = JSON.parse(raw);
    const normalized = {
      ...createInitialState(),
      ...parsed,
      users: parsed.users || clone(seedUsers),
      courses: parsed.courses || clone(seedCourses),
      enrollments: parsed.enrollments || clone(seedEnrollments),
      progress: parsed.progress || clone(seedProgress),
      payments: parsed.payments || [],
      reports: parsed.reports || clone(seedReports),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
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

function ensureEnrollment(draft, courseId, userId, lessonId) {
  const exists = draft.enrollments.find((item) => item.userId === userId && item.courseId === courseId);
  if (exists) {
    return exists;
  }

  const enrollment = {
    id: `enrollment-${Date.now()}`,
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
  };

  draft.enrollments.unshift(enrollment);

  draft.progress.unshift({
    id: `progress-${Date.now()}`,
    userId,
    courseId,
    lastLessonId: lessonId,
    completedLessonIds: [],
    lessonTimes: {},
    quizResults: {},
    updatedAt: new Date().toISOString(),
  });

  const course = draft.courses.find((item) => item.id === courseId);
  if (course) {
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    course.updatedAt = new Date().toISOString();
  }

  return enrollment;
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
  if (duration === "under-2") return course.durationMinutes < 120;
  if (duration === "2-10") return course.durationMinutes >= 120 && course.durationMinutes <= 600;
  if (duration === "10-plus") return course.durationMinutes > 600;
  return course.durationMinutes >= 900;
}

function priceFilter(course, price) {
  if (!price || price === "any") return true;
  if (price === "free") return Number(course.price) === 0;
  if (price === "paid") return Number(course.price) > 0;
  return true;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.length) return [value];
  return [];
}

function sortCourses(courses, sort) {
  const items = [...courses];
  if (sort === "newest") {
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (sort === "highest-rated") {
    return items.sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount);
  }
  if (sort === "most-popular") {
    return items.sort((a, b) => b.enrollmentCount - a.enrollmentCount || b.trendingScore - a.trendingScore);
  }
  if (sort === "price-low") {
    return items.sort((a, b) => a.price - b.price || b.ratingAverage - a.ratingAverage);
  }
  if (sort === "price-high") {
    return items.sort((a, b) => b.price - a.price || b.ratingAverage - a.ratingAverage);
  }
  if (sort === "relevance") {
    return items.sort((a, b) => b.trendingScore - a.trendingScore || b.ratingAverage - a.ratingAverage);
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
  const uniqueStudents = Array.from(new Set(enrollments.map((item) => item.userId))).length;
  const totalRevenue = courses.reduce((total, course) => {
    const count = enrollments.filter((item) => item.courseId === course.id).length;
    return total + count * course.price;
  }, 0);
  const averageRating = courses.length ? (courses.reduce((sum, course) => sum + (course.ratingAverage || 0), 0) / courses.length).toFixed(1) : "0.0";
  const publishedCourses = courses.filter((course) => course.status === "approved").length;
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const recentProgress = db.progress.filter((entry) => new Date(entry.updatedAt) >= sevenDaysAgo && courses.some((course) => course.id === entry.courseId));
  const activeLearnersLast7Days = Array.from(new Set(recentProgress.map((entry) => entry.userId))).length;

  const enrollmentByDay = {};
  enrollments.forEach((enrollment) => {
    const day = new Date(enrollment.enrolledAt).toISOString().slice(0, 10);
    enrollmentByDay[day] = (enrollmentByDay[day] || 0) + 1;
  });

  const enrollmentTrend = Array.from({ length: 30 }).map((_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (29 - index));
    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const key = day.toISOString().slice(0, 10);
    return { label, count: enrollmentByDay[key] || 0 };
  });

  const revenueByMonth = {};
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = month.toLocaleString("en-US", { month: "short" });
    const key = `${month.getFullYear()}-${month.getMonth() + 1}`;
    monthLabels.push({ label, key });
    revenueByMonth[key] = 0;
  }
  enrollments.forEach((enrollment) => {
    const month = new Date(enrollment.enrolledAt);
    const key = `${month.getFullYear()}-${month.getMonth() + 1}`;
    const course = courses.find((item) => item.id === enrollment.courseId);
    if (course && revenueByMonth[key] !== undefined) {
      revenueByMonth[key] += course.price;
    }
  });

  const revenueTrend = monthLabels.map(({ label, key }) => ({ label, amount: revenueByMonth[key] || 0 }));

  const topCourses = courses
    .map((course) => {
      const enrollmentCount = enrollments.filter((item) => item.courseId === course.id).length;
      return {
        ...course,
        enrollmentCount,
        revenue: `$${(enrollmentCount * course.price).toLocaleString()}`,
      };
    })
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5);

  const workflowChecks = courses.map((course) => ({
    id: course.id,
    title: course.title,
    thumbnail: course.thumbnail,
    hasThumbnail: Boolean(course.thumbnail),
    hasDescription: Boolean(course.description),
    hasPublishedModule: course.modules.some((module) => module.lessons.length > 0),
    hasPricing: course.price > 0 || course.status === "draft",
    editUrl: `/instructor/course/${course.id}/edit`,
    published: course.status === "approved",
  }));

  const activityFeed = [
    ...enrollments.slice(-4).reverse().map((enrollment) => {
      const student = db.users.find((user) => user.id === enrollment.userId);
      const course = courses.find((item) => item.id === enrollment.courseId);
      return {
        id: enrollment.id,
        title: `${student?.name || "A learner"} enrolled in ${course?.title}`,
        time: new Date(enrollment.enrolledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        type: "enrollment",
      };
    }),
    ...courses.flatMap((course) => course.reviews.slice(0, 2).map((review) => ({
      id: review.id,
      title: `${review.userName} left a ${review.rating}-star review on ${course.title}`,
      time: new Date(review.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      type: "review",
    }))),
  ].slice(0, 6);

  const engagementSnapshot = courses.map((course) => {
    const lessonCount = course.totalLessons || 1;
    const progressEntries = db.progress.filter((entry) => entry.courseId === course.id);
    const completionRate = progressEntries.length ? Math.round((progressEntries.reduce((sum, entry) => sum + ((entry.completedLessonIds?.length || 0) / lessonCount) * 100, 0) / progressEntries.length)) : 0;
    return { id: course.id, title: course.title, completionRate };
  });

  return {
    stats: [
      { label: "Total students", value: String(uniqueStudents), detail: "Across your published courses" },
      { label: "Total revenue", value: `$${totalRevenue.toLocaleString()}`, detail: "Lifetime gross" },
      { label: "Avg rating", value: averageRating, detail: "Across your catalog" },
      { label: "Published courses", value: String(publishedCourses), detail: "Live and discoverable" },
    ],
    courses,
    uniqueStudents,
    totalRevenue,
    averageRating,
    publishedCourses,
    enrollmentTrend,
    revenueTrend,
    topCourses,
    courseHealth: topCourses,
    workflowChecks,
    activityFeed,
    engagementSnapshot,
    activeLearnersLast7Days,
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
    const {
      page = 1,
      pageSize = 6,
      search = "",
      category = "All",
      level = "All",
      duration = "All",
      rating = "",
      sort = "trending",
      status = "approved",
      instructorId,
      price = "any",
      language = "",
    } = params;
    const categories = normalizeList(category).filter((item) => item !== "All");
    const levels = normalizeList(level).filter((item) => item !== "All" && item !== "All levels");
    const languages = normalizeList(language).filter((item) => item !== "All");
    let courses = db.courses.filter((course) => (status === "all" ? true : course.status === status));
    if (instructorId) {
      courses = courses.filter((course) => course.instructorId === instructorId);
    }
    const normalizedSearch = String(search).trim().toLowerCase();
    courses = courses.filter((course) => {
      const skillsText = Array.isArray(course.skills) ? course.skills.join(" ").toLowerCase() : "";
      const matchesSearch =
        !normalizedSearch ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.description.toLowerCase().includes(normalizedSearch) ||
        (course.instructorName || "").toLowerCase().includes(normalizedSearch) ||
        (course.category || "").toLowerCase().includes(normalizedSearch) ||
        skillsText.includes(normalizedSearch);
      const matchesCategory = categories.length === 0 || categories.includes(course.category);
      const matchesLevel = levels.length === 0 || levels.includes(course.level);
      const matchesLanguage = languages.length === 0 || languages.includes(course.language || "English");
      return matchesSearch && matchesCategory && matchesLevel && matchesLanguage && durationFilter(course, duration) && ratingFilter(course, rating) && priceFilter(course, price);
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

  if (path.startsWith("/courses/") && path.endsWith("/students")) {
    const courseId = path.split("/")[2];
    const enrollments = db.enrollments.filter((enrollment) => enrollment.courseId === courseId);
    return enrollments.map((enrollment) => {
      const user = db.users.find((item) => item.id === enrollment.userId);
      const progress = db.progress.find((item) => item.userId === enrollment.userId && item.courseId === courseId) || {};
      return {
        id: enrollment.id,
        name: user?.name || "Student",
        email: user?.email || "unknown",
        enrolledAt: new Date(enrollment.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        progressPercent: progress.completedLessonIds ? Math.round((progress.completedLessonIds.length / (db.courses.find((course) => course.id === courseId)?.modules.flatMap((m) => m.lessons).length || 1)) * 100) : 0,
        lastActive: progress.updatedAt ? new Date(progress.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-",
        rating: Object.values(progress.quizResults || {})[0]?.score || null,
        completedLessons: progress.completedLessonIds?.length || 0,
        quizScore: Object.values(progress.quizResults || {})[0]?.score,
      };
    });
  }

  if (path.startsWith("/courses/")) {
    const courseId = path.split("/")[2];
    const course = db.courses.find((item) => item.id === courseId || item.slug === courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    return getCourseRuntime(course);
  }

  if (path === "/dashboard/instructor/analytics") {
    const courses = db.courses.filter((course) => course.instructorId === params.userId).map(getCourseRuntime);
    const enrollments = db.enrollments.filter((enrollment) => courses.some((course) => course.id === enrollment.courseId));
    const courseRevenue = courses.map((course) => {
      const count = enrollments.filter((enrollment) => enrollment.courseId === course.id).length;
      return {
        id: course.id,
        title: course.title,
        revenue: `$${(count * course.price).toLocaleString()}`,
        share: Math.round(((count * course.price) / Math.max(1, courses.reduce((sum, next) => sum + next.price * enrollments.filter((item) => item.courseId === next.id).length, 0))) * 100) || 0,
      };
    });
    const totalRevenue = courses.reduce((sum, course) => {
      const count = enrollments.filter((item) => item.courseId === course.id).length;
      return sum + count * course.price;
    }, 0);
    const revenueOverTime = Array.from({ length: 6 }, (_, index) => ({
      label: new Date(new Date().setMonth(new Date().getMonth() - (5 - index))).toLocaleString("en-US", { month: "short" }),
      amount: Math.round(totalRevenue / 6),
    }));
    const topCountries = ["US", "UK", "CA", "DE", "AU"];
    return {
      revenueSummary: {
        lifetimeRevenue: `$${totalRevenue.toLocaleString()}`,
        currentMonth: `$${Math.round(totalRevenue / 12).toLocaleString()}`,
        maxRevenue: Math.max(...revenueOverTime.map((item) => item.amount), 1),
        pendingEarnings: `$${Math.round(totalRevenue * 0.12).toLocaleString()}`,
        currentBalance: `$${Math.round(totalRevenue * 0.25).toFixed(2)}`,
      },
      revenueByCourse: courseRevenue,
      revenueOverTime,
      learnerStats: {
        totalLearners: Array.from(new Set(enrollments.map((item) => item.userId))).length,
        newThisWeek: Math.max(0, enrollments.length - 2),
        activeThisWeek: Math.min(enrollments.length, 12),
        topCountries,
        deviceBreakdown: { desktop: 68, mobile: 22, tablet: 10 },
      },
      reviewStats: {
        distribution: [
          { rating: 5, count: 24, share: 45 },
          { rating: 4, count: 12, share: 25 },
          { rating: 3, count: 6, share: 15 },
          { rating: 2, count: 2, share: 8 },
          { rating: 1, count: 1, share: 7 },
        ],
        latest: courses.flatMap((course) => course.reviews.slice(0, 2).map((review) => ({
          id: review.id,
          studentName: review.userName,
          courseTitle: course.title,
          rating: review.rating,
          comment: review.comment,
        }))),
      },
      payoutHistory: [
        { id: "payout-1", date: "Mar 1, 2026", amount: "$4,500.00", status: "Paid", method: "Stripe" },
        { id: "payout-2", date: "Feb 1, 2026", amount: "$3,200.00", status: "Paid", method: "Stripe" },
      ],
    };
  }

  if (path === "/dashboard/instructor/revenue") {
    const courses = db.courses.filter((course) => course.instructorId === params.userId);
    const enrollments = db.enrollments.filter((enrollment) => courses.some((course) => course.id === enrollment.courseId));
    const totalRevenue = courses.reduce((sum, course) => {
      const count = enrollments.filter((item) => item.courseId === course.id).length;
      return sum + count * course.price;
    }, 0);
    return {
      summary: {
        lifetimeEarnings: `$${totalRevenue.toLocaleString()}`,
        currentBalance: `$${Math.round(totalRevenue * 0.25).toFixed(2)}`,
        pendingEarnings: `$${Math.round(totalRevenue * 0.1).toLocaleString()}`,
      },
      transactions: enrollments.slice(0, 8).map((enrollment) => {
        const course = courses.find((item) => item.id === enrollment.courseId);
        const student = db.users.find((user) => user.id === enrollment.userId);
        return {
          id: enrollment.id,
          studentName: student?.name || "Student",
          courseTitle: course?.title || "Course",
          amount: `$${course?.price?.toFixed(2) || "0.00"}`,
          net: `$${Math.max(0, course?.price * 0.85).toFixed(2)}`,
          date: new Date(enrollment.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
      }),
      payoutHistory: [
        { id: "payout-1", date: "Mar 1, 2026", amount: "$4,500.00", status: "Paid", method: "Stripe" },
        { id: "payout-2", date: "Feb 1, 2026", amount: "$3,200.00", status: "Paid", method: "Stripe" },
      ],
    };
  }

  if (path === "/instructor/notifications") {
    const recentEnrollments = db.enrollments.slice(-4).reverse();
    const recentReviews = db.courses.flatMap((course) => course.reviews.slice(0, 3).map((review) => ({
      id: review.id,
      title: `${review.userName} left a ${review.rating}-star review`,
      body: `${review.comment.slice(0, 80)}... on ${course.title}`,
      time: new Date(review.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      read: false,
    })));
    const enrollNotifications = recentEnrollments.map((enrollment) => {
      const user = db.users.find((item) => item.id === enrollment.userId);
      const course = db.courses.find((item) => item.id === enrollment.courseId);
      return {
        id: enrollment.id,
        title: `${user?.name || "Student"} enrolled in ${course?.title}`,
        body: `New enrollment for ${course?.title}`,
        time: new Date(enrollment.enrolledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        read: false,
      };
    });
    return [...enrollNotifications, ...recentReviews].slice(0, 8);
  }

  if (path.startsWith("/instructors/") && path.endsWith("/public")) {
    const instructorId = path.split("/")[2];
    const instructor = db.users.find((item) => item.id === instructorId);
    if (!instructor) {
      throw new Error("Instructor not found");
    }
    const courses = db.courses.filter((course) => course.instructorId === instructorId && course.status === "approved").map(getCourseRuntime);
    const enrollments = db.enrollments.filter((enrollment) => courses.some((course) => course.id === enrollment.courseId));
    const reviews = courses.flatMap((course) => course.reviews.map((review) => ({ ...review, courseTitle: course.title })));
    const totalStudents = enrollments.length;
    const avgRating = courses.length ? (courses.reduce((sum, course) => sum + course.ratingAverage, 0) / courses.length).toFixed(1) : "0.0";
    const reviewDistribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter((review) => review.rating === rating).length;
      return {
        rating,
        count,
        percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
      };
    });
    return {
      instructor: {
        ...instructor,
        bio: instructor.bio || "Experienced instructor building modern learning experiences.",
        website: instructor.website || "https://EduSphere.app",
        twitter: instructor.twitter || "https://twitter.com/edusphere",
        linkedin: instructor.linkedin || "https://linkedin.com",
        youtube: instructor.youtube || "https://youtube.com",
        topics: instructor.topics || [],
      },
      courses: courses.sort((a, b) => b.enrollmentCount - a.enrollmentCount),
      reviewStats: {
        avgRating,
        totalStudents,
        totalReviews: reviews.length,
        distribution: reviewDistribution,
        latestReviews: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      },
    };
  }

  if (path.startsWith("/instructors/")) {
    const instructorId = path.split("/")[2];
    const instructor = db.users.find((item) => item.id === instructorId);
    if (!instructor) {
      throw new Error("Instructor not found");
    }
    return instructor;
  }

  if (path === "/enrollments") {
    const { userId } = params;
    return db.enrollments.filter((item) => item.userId === userId);
  }

  if (path === "/progress") {
    const { userId, courseId } = params;
    return db.progress.find((item) => item.userId === userId && item.courseId === courseId) || null;
  }

  if (path === "/payments/status") {
    const { userId, courseId } = params;
    const payment = db.payments.find((item) => item.userId === userId && item.courseId === courseId && item.status === "paid");
    return {
      hasPaid: Boolean(payment),
      payment: payment || null,
    };
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
      const role = body.role === "instructor" ? "instructor" : "student";
      const nextUser = {
        id: `user-${Date.now()}`,
        name: body.name,
        email: body.email,
        password: body.password,
        role,
        headline: role === "instructor" ? body.teachingTopic || "Instructor application pending" : "New learner",
        avatar: body.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        bio: role === "instructor" ? `<p>${String(body.bio || "").trim()}</p>` : "",
        topics: role === "instructor" && body.teachingTopic ? [body.teachingTopic] : [],
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
      ensureEnrollment(draft, body.courseId, body.userId, body.lessonId);
      return draft;
    }).enrollments[0];
  }

  if (path === "/payments/checkout") {
    const db = withDb((draft) => {
      const existingPayment = draft.payments.find((item) => item.userId === body.userId && item.courseId === body.courseId && item.status === "paid");
      if (!existingPayment) {
        draft.payments.unshift({
          id: `payment-${Date.now()}`,
          userId: body.userId,
          courseId: body.courseId,
          amount: Number(body.amount || 0),
          cardLast4: String(body.cardNumber || "").replace(/\D/g, "").slice(-4),
          cardholderName: body.cardholderName,
          status: "paid",
          transactionId: `txn-${Date.now()}`,
          paidAt: new Date().toISOString(),
        });
      }

      ensureEnrollment(draft, body.courseId, body.userId, body.lessonId);
      return draft;
    });

    const payment = db.payments.find((item) => item.userId === body.userId && item.courseId === body.courseId && item.status === "paid");
    return {
      success: true,
      payment,
    };
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
        tags: body.tags || [],
        language: body.language || "English",
        promoVideoUrl: body.promoVideoUrl || "",
        urlSlug: body.slug,
        metaDescription: body.metaDescription || "",
        certificateEnabled: body.certificateEnabled || false,
        discussionEnabled: body.discussionEnabled || false,
        dripEnabled: body.dripEnabled || false,
        enrollmentLimitEnabled: body.enrollmentLimitEnabled || false,
        enrollmentLimit: body.enrollmentLimit || 0,
        reviews: [],
      };
      draft.courses.unshift(course);
      return draft;
    });
    return getCourseRuntime(db.courses[0]);
  }

  if (path.startsWith("/courses/") && path.endsWith("/duplicate")) {
    const courseId = path.split("/")[2];
    const db = withDb((draft) => {
      const source = draft.courses.find((item) => item.id === courseId);
      if (!source) {
        throw new Error("Course not found");
      }
      const copy = {
        ...clone(source),
        id: `course-${Date.now()}`,
        slug: `${source.slug}-copy-${Date.now()}`,
        title: `${source.title} (Copy)`,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      draft.courses.unshift(copy);
      return draft;
    });
    return getCourseRuntime(db.courses[0]);
  }

  if (path.startsWith("/courses/") && path.endsWith("/publish")) {
    const courseId = path.split("/")[2];
    const db = withDb((draft) => {
      const course = draft.courses.find((item) => item.id === courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      course.status = "approved";
      course.updatedAt = new Date().toISOString();
      return draft;
    });
    return getCourseRuntime(db.courses.find((item) => item.id === path.split("/")[2]));
  }

  if (path.startsWith("/courses/") && path.endsWith("/archive")) {
    const courseId = path.split("/")[2];
    const db = withDb((draft) => {
      const course = draft.courses.find((item) => item.id === courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      course.status = "archived";
      course.updatedAt = new Date().toISOString();
      return draft;
    });
    return getCourseRuntime(db.courses.find((item) => item.id === path.split("/")[2]));
  }

  if (path === "/reviews" ) {
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

  if (path.startsWith("/reviews/") && path.endsWith("/reply")) {
    return { success: true };
  }

  if (path.startsWith("/instructor/") && path.endsWith("/payout")) {
    return { id: `payout-${Date.now()}`, amount: `$${body.amount.toFixed(2)}`, status: "Pending", requestedAt: new Date().toISOString() };
  }

  throw new Error(`Unknown POST path: ${path}`);
}

async function handlePatch(path, body = {}) {
  if (path.startsWith("/courses/") && !path.endsWith("/publish") && !path.endsWith("/archive")) {
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

  if (path.startsWith("/notifications/") && path.endsWith("/read")) {
    return { success: true };
  }

  if (path.startsWith("/instructor/") && path.endsWith("/payout")) {
    return { id: `payout-${Date.now()}`, amount: `$${body.amount.toFixed(2)}`, status: "Pending", requestedAt: new Date().toISOString() };
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
