import pool from '../config/db.js';
import { serializeEnrollment } from '../utils/serialize.js';

// GET /courses/:courseId/students — list enrollments for a course, instructor only
export async function listCourseStudents(req, res) {
  try {
    const { courseId } = req.params;
    const courseResult = await pool.query(`SELECT instructor_id FROM courses WHERE id = $1`, [courseId]);
    if (courseResult.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role !== 'admin' && courseResult.rows[0].instructor_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not your course' });
    }
    const result = await pool.query(
      `SELECT id, user_id, enrolled_at FROM enrollments WHERE course_id = $1 ORDER BY enrolled_at DESC`,
      [courseId]
    );
    res.json(
      result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        enrolledAt: row.enrolled_at,
        // name/email live in auth_service — the frontend can fetch /auth/users/:id/profile
        // on demand if it needs them. Keeping this endpoint cross-service-free.
      }))
    );
  } catch (err) {
    console.error('[courses-service] listCourseStudents failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function listEnrollments(req, res) {
  try {
    const userId = Number(req.query.userId || req.user?.user_id);
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const result = await pool.query(
      `SELECT e.id, e.user_id, e.course_id, e.enrolled_at,
              c.title, c.slug, c.thumbnail, c.accent, c.category, c.level, c.instructor_name
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
    res.json(result.rows.map(serializeEnrollment));
  } catch (err) {
    console.error('[courses-service] listEnrollments failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function enroll(req, res) {
  const client = await pool.connect();
  try {
    const courseId = req.params.id;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    const courseResult = await client.query(
      `SELECT id FROM courses WHERE id = $1 AND status = 'approved'`,
      [courseId]
    );
    if (courseResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Course not available for enrollment' });
    }

    const insert = await client.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [userId, courseId]
    );

    if (insert.rows.length > 0) {
      await client.query(
        `UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = $1`,
        [courseId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(insert.rows[0] || { alreadyEnrolled: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[courses-service] enroll failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}
