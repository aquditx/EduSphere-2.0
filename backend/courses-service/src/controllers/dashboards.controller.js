import pool from '../config/db.js';
import { serializeCourse } from '../utils/serialize.js';

// --- Admin dashboard ---
// Returns: stats[], topCourses, recentEnrollments, revenueSeries

export async function adminDashboard(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const [coursesAgg, enrollmentsAgg, revenueAgg, topResult, recentResult] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
           COUNT(*) FILTER (WHERE status = 'draft')::int AS draft
         FROM courses`
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM enrollments`),
      pool.query(
        `SELECT COALESCE(SUM(c.price), 0)::numeric(12,2) AS total
         FROM enrollments e JOIN courses c ON c.id = e.course_id`
      ),
      pool.query(
        `SELECT c.* FROM courses c
         ORDER BY c.enrollment_count DESC, c.rating_average DESC
         LIMIT 5`
      ),
      pool.query(
        `SELECT e.id, e.user_id, e.course_id, e.enrolled_at, c.title
         FROM enrollments e JOIN courses c ON c.id = e.course_id
         ORDER BY e.enrolled_at DESC LIMIT 8`
      ),
    ]);

    res.json({
      stats: [
        { label: 'Total courses', value: String(coursesAgg.rows[0].total), detail: `${coursesAgg.rows[0].approved} approved, ${coursesAgg.rows[0].pending} pending` },
        { label: 'Enrollments', value: String(enrollmentsAgg.rows[0].total), detail: 'All time' },
        { label: 'Revenue', value: `$${Number(revenueAgg.rows[0].total).toLocaleString()}`, detail: 'Lifetime (mock pricing)' },
        { label: 'Draft courses', value: String(coursesAgg.rows[0].draft), detail: 'Awaiting instructor publish' },
      ],
      topCourses: topResult.rows.map(serializeCourse),
      recentEnrollments: recentResult.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        courseId: row.course_id,
        courseTitle: row.title,
        enrolledAt: row.enrolled_at,
      })),
    });
  } catch (err) {
    console.error('[courses-service] adminDashboard failed', err);
    res.status(500).json({ error: err.message });
  }
}

// --- Student dashboard ---
// Returns: heroCourse, continueLearning, stats, activity
// Progress metrics (progressPercent, hoursWatched, avg quiz score) are stubbed
// here — they live in the separate progress-tracker (MongoDB) service. The
// frontend can overlay them with a second call to /api/progress if desired.

export async function studentDashboard(req, res) {
  try {
    const userId = req.user.user_id;

    const enrolled = await pool.query(
      `SELECT c.*,
              e.enrolled_at,
              (SELECT COUNT(*)
                 FROM lessons l
                 JOIN modules m ON m.id = l.module_id
                WHERE m.course_id = c.id)::int AS total_lessons,
              (SELECT l.id
                 FROM lessons l
                 JOIN modules m ON m.id = l.module_id
                WHERE m.course_id = c.id
                ORDER BY m.position, l.position
                LIMIT 1) AS first_lesson_id
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    const enrolledCourses = enrolled.rows.map((row) => ({
      ...serializeCourse(row),
      totalLessons: row.total_lessons,
      resumeLessonId: row.first_lesson_id,
      progressPercent: 0, // TODO: enrich from progress-tracker
      enrolledAt: row.enrolled_at,
    }));

    const heroCourse = enrolledCourses[0] || null;

    res.json({
      heroCourse,
      continueLearning: enrolledCourses,
      stats: [
        {
          label: 'Active enrollments',
          value: String(enrolledCourses.length),
          detail: `${enrolledCourses.length} courses in your library`,
        },
        {
          label: 'Hours watched',
          value: '—',
          detail: 'Progress tracking service overlays this',
        },
        {
          label: 'Average score',
          value: '—',
          detail: 'Complete a quiz to see your score',
        },
        {
          label: 'Certificates',
          value: '0',
          detail: 'Earned after course completion',
        },
      ],
      activity: [],
    });
  } catch (err) {
    console.error('[courses-service] studentDashboard failed', err);
    res.status(500).json({ error: err.message });
  }
}

// --- Instructor dashboard ---
// Returns: heroCourse, stats, topCourses, recentEnrollments, trend, reviewAverage
// Aggregates from courses + enrollments + reviews where instructor_id = me.

export async function instructorDashboard(req, res) {
  try {
    const instructorId = req.user.user_id;

    const coursesResult = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*)
                 FROM enrollments e WHERE e.course_id = c.id)::int AS enrollment_total
       FROM courses c
       WHERE c.instructor_id = $1
       ORDER BY c.updated_at DESC`,
      [instructorId]
    );

    const courses = coursesResult.rows.map(serializeCourse);
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((course) => course.status === 'approved').length;
    const totalEnrollments = coursesResult.rows.reduce(
      (sum, row) => sum + (row.enrollment_total || 0),
      0
    );
    const totalRevenue = coursesResult.rows.reduce(
      (sum, row) => sum + Number(row.price || 0) * (row.enrollment_total || 0),
      0
    );
    const ratingAverage = totalCourses > 0
      ? (courses.reduce((sum, course) => sum + (course.ratingAverage || 0), 0) / totalCourses).toFixed(1)
      : '0.0';

    const recentEnrollmentsResult = await pool.query(
      `SELECT e.id, e.user_id, e.enrolled_at, c.id AS course_id, c.title AS course_title
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE c.instructor_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT 8`,
      [instructorId]
    );

    const recentReviewsResult = await pool.query(
      `SELECT r.*, c.title AS course_title
       FROM reviews r
       JOIN courses c ON c.id = r.course_id
       WHERE c.instructor_id = $1
       ORDER BY r.created_at DESC
       LIMIT 6`,
      [instructorId]
    );

    res.json({
      heroCourse: courses[0] || null,
      stats: [
        { label: 'Courses', value: String(totalCourses), detail: `${publishedCourses} published` },
        { label: 'Enrollments', value: String(totalEnrollments), detail: 'Across all courses' },
        { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, detail: 'Lifetime (mock pricing)' },
        { label: 'Avg. rating', value: ratingAverage, detail: 'From learner reviews' },
      ],
      topCourses: courses.slice(0, 5),
      recentEnrollments: recentEnrollmentsResult.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        courseId: row.course_id,
        courseTitle: row.course_title,
        enrolledAt: row.enrolled_at,
      })),
      recentReviews: recentReviewsResult.rows.map((row) => ({
        id: row.id,
        courseId: row.course_id,
        courseTitle: row.course_title,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
      })),
    });
  } catch (err) {
    console.error('[courses-service] instructorDashboard failed', err);
    res.status(500).json({ error: err.message });
  }
}
