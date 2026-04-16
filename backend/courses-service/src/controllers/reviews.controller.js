import pool from '../config/db.js';
import { serializeReview } from '../utils/serialize.js';

export async function listReviews(req, res) {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT * FROM reviews WHERE course_id = $1 ORDER BY created_at DESC`,
      [courseId]
    );
    res.json(result.rows.map(serializeReview));
  } catch (err) {
    console.error('[courses-service] listReviews failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function submitReview(req, res) {
  const client = await pool.connect();
  try {
    const { courseId } = req.params;
    const { rating, comment, user_name } = req.body;
    const userId = req.user.user_id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }
    if (!user_name) {
      return res.status(400).json({ error: 'user_name required (denormalized for fast reads)' });
    }

    await client.query('BEGIN');

    const insert = await client.query(
      `INSERT INTO reviews (course_id, user_id, user_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (course_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
       RETURNING *`,
      [courseId, userId, user_name, rating, comment || null]
    );

    // Recompute course aggregates (rating_average, rating_count) in the same transaction.
    const aggregate = await client.query(
      `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg, COUNT(*)::int AS count
       FROM reviews WHERE course_id = $1`,
      [courseId]
    );
    await client.query(
      `UPDATE courses SET rating_average = $1, rating_count = $2, updated_at = NOW() WHERE id = $3`,
      [aggregate.rows[0].avg, aggregate.rows[0].count, courseId]
    );

    await client.query('COMMIT');
    res.status(201).json(serializeReview(insert.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[courses-service] submitReview failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}
